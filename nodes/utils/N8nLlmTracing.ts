/**
 * N8nLlmTracing callback handler for LangChain integration.
 * Enables execution tracking and logging for AI nodes in n8n's Executions view.
 *
 * This implementation is based on n8n's official N8nLlmTracing class from
 * @n8n/nodes-langchain package.
 */
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import type { Serialized, SerializedNotImplemented, SerializedSecret } from '@langchain/core/load/serializable';
import type { BaseMessage } from '@langchain/core/messages';
import type { LLMResult } from '@langchain/core/outputs';
import type { ISupplyDataFunctions, IDataObject, JsonObject, AiEvent } from 'n8n-workflow';
import { NodeConnectionTypes, NodeError, NodeOperationError } from 'n8n-workflow';

// Type from @langchain/core/load/map_keys - defined inline to avoid import issues
type SerializedFields = Record<string, unknown>;

type TokensUsageParser = (result: LLMResult) => {
	completionTokens: number;
	promptTokens: number;
	totalTokens: number;
};

type RunDetail = {
	index: number;
	messages: BaseMessage[] | string[] | string;
	options: SerializedSecret | SerializedNotImplemented | SerializedFields;
};

/**
 * Helper function to safely stringify data for logging.
 */
function jsonStringify(data: IDataObject): string {
	try {
		return JSON.stringify(data);
	} catch {
		return String(data);
	}
}

/**
 * Helper function to log AI events.
 */
function logAiEvent(
	executeFunctions: ISupplyDataFunctions,
	event: AiEvent,
	data?: IDataObject,
): void {
	try {
		executeFunctions.logAiEvent(event, data ? jsonStringify(data) : undefined);
	} catch {
		// Silently ignore logging errors to not disrupt workflow execution
	}
}

/**
 * Callback handler that enables execution tracking for LangChain models in n8n.
 * This allows the n8n UI to show:
 * - Green border around executed nodes
 * - Tick marks and execution counts
 * - Log dropdown with each LLM iteration
 * - Error messages for failed calls
 */
export class N8nLlmTracing extends BaseCallbackHandler {
	name = 'N8nLlmTracing';

	// This flag makes sure that LangChain will wait for the handlers to finish before continuing
	awaitHandlers = true;

	connectionType = NodeConnectionTypes.AiLanguageModel;

	promptTokensEstimate = 0;

	completionTokensEstimate = 0;

	#parentRunIndex?: number;

	/**
	 * A map to associate LLM run IDs to run details.
	 * Key: Unique identifier for each LLM run (run ID)
	 * Value: RunDetails object
	 */
	runsMap: Record<string, RunDetail> = {};

	options = {
		// Default (OpenAI format) parser
		tokensUsageParser: (result: LLMResult) => {
			const completionTokens = (result?.llmOutput?.tokenUsage?.completionTokens as number) ?? 0;
			const promptTokens = (result?.llmOutput?.tokenUsage?.promptTokens as number) ?? 0;

			return {
				completionTokens,
				promptTokens,
				totalTokens: completionTokens + promptTokens,
			};
		},
		errorDescriptionMapper: (error: NodeError) => error.description,
	};

	constructor(
		private executionFunctions: ISupplyDataFunctions,
		options?: {
			tokensUsageParser?: TokensUsageParser;
			errorDescriptionMapper?: (error: NodeError) => string;
		},
	) {
		super();
		this.options = { ...this.options, ...options };
	}

	/**
	 * Estimate token count from a string list.
	 * Simple estimation: ~4 characters per token (rough average).
	 */
	estimateTokensFromStringList(list: string[]): number {
		const totalChars = list.reduce((sum, str) => sum + str.length, 0);
		return Math.ceil(totalChars / 4);
	}

	/**
	 * Estimate tokens from generation results.
	 */
	estimateTokensFromGeneration(generations: LLMResult['generations']): number {
		const messages = generations.flatMap((gen) => gen.map((g) => g.text));
		return this.estimateTokensFromStringList(messages);
	}

	/**
	 * Called at the start of an LLM run.
	 * Registers the input data with n8n's execution tracking.
	 */
	async handleLLMStart(llm: Serialized, prompts: string[], runId: string): Promise<void> {
		const estimatedTokens = this.estimateTokensFromStringList(prompts);
		const sourceNodeRunIndex =
			this.#parentRunIndex !== undefined
				? this.#parentRunIndex + this.executionFunctions.getNextRunIndex()
				: undefined;

		const options = llm.type === 'constructor' ? llm.kwargs : llm;
		const { index } = this.executionFunctions.addInputData(
			this.connectionType,
			[
				[
					{
						json: {
							messages: prompts,
							estimatedTokens,
							options,
						},
					},
				],
			],
			sourceNodeRunIndex,
		);

		// Save the run details for later use when processing handleLLMEnd event
		this.runsMap[runId] = {
			index,
			options,
			messages: prompts,
		};
		this.promptTokensEstimate = estimatedTokens;
	}

	/**
	 * Called at the start of a Chat Model run.
	 * Handles the messages format for chat models.
	 */
	async handleChatModelStart(
		llm: Serialized,
		messages: BaseMessage[][],
		runId: string,
	): Promise<void> {
		// Convert messages to string representation for token estimation
		const flatMessages = messages.flat();
		const stringMessages = flatMessages.map((m) => {
			if (typeof m === 'string') return m;
			if (typeof m?.content === 'string') return m.content;
			return JSON.stringify(m);
		});

		const estimatedTokens = this.estimateTokensFromStringList(stringMessages);
		const sourceNodeRunIndex =
			this.#parentRunIndex !== undefined
				? this.#parentRunIndex + this.executionFunctions.getNextRunIndex()
				: undefined;

		const options = llm.type === 'constructor' ? llm.kwargs : llm;
		const { index } = this.executionFunctions.addInputData(
			this.connectionType,
			[
				[
					{
						json: {
							messages: flatMessages.map((m) => {
								if (typeof m === 'string') return m;
								if (typeof m?.toJSON === 'function') return m.toJSON();
								return m;
							}),
							estimatedTokens,
							options,
						},
					},
				],
			],
			sourceNodeRunIndex,
		);

		// Save the run details for later use when processing handleLLMEnd event
		this.runsMap[runId] = {
			index,
			options,
			messages: flatMessages,
		};
		this.promptTokensEstimate = estimatedTokens;
	}

	/**
	 * Called at the end of an LLM run.
	 * Registers the output data and logs the AI event.
	 */
	async handleLLMEnd(output: LLMResult, runId: string): Promise<void> {
		// The fallback should never happen since handleLLMStart should always set the run details
		const runDetails = this.runsMap[runId] ?? { index: Object.keys(this.runsMap).length };

		// Extract only necessary fields from generations
		const generations = output.generations.map((gen) =>
			gen.map((g) => ({ text: g.text, generationInfo: g.generationInfo })),
		);

		const tokenUsageEstimate = {
			completionTokens: 0,
			promptTokens: 0,
			totalTokens: 0,
		};
		const tokenUsage = this.options.tokensUsageParser(output);

		if (output.generations.length > 0) {
			tokenUsageEstimate.completionTokens = this.estimateTokensFromGeneration(output.generations);
			tokenUsageEstimate.promptTokens = this.promptTokensEstimate;
			tokenUsageEstimate.totalTokens =
				tokenUsageEstimate.completionTokens + this.promptTokensEstimate;
		}

		const response: {
			response: { generations: typeof generations };
			tokenUsageEstimate?: typeof tokenUsageEstimate;
			tokenUsage?: typeof tokenUsage;
		} = {
			response: { generations },
		};

		// If the LLM response contains actual tokens usage, use it; otherwise fallback to estimate
		if (tokenUsage.completionTokens > 0) {
			response.tokenUsage = tokenUsage;
		} else {
			response.tokenUsageEstimate = tokenUsageEstimate;
		}

		const parsedMessages =
			typeof runDetails.messages === 'string'
				? runDetails.messages
				: runDetails.messages.map((message) => {
						if (typeof message === 'string') return message;
						if (typeof message?.toJSON === 'function') return message.toJSON();
						return message;
					});

		const sourceNodeRunIndex =
			this.#parentRunIndex !== undefined ? this.#parentRunIndex + runDetails.index : undefined;

		this.executionFunctions.addOutputData(
			this.connectionType,
			runDetails.index,
			[[{ json: { ...response } }]],
			undefined,
			sourceNodeRunIndex,
		);

		logAiEvent(this.executionFunctions, 'ai-llm-generated-output', {
			messages: parsedMessages as unknown as IDataObject,
			options: runDetails.options as unknown as IDataObject,
			response: response as unknown as IDataObject,
		});
	}

	/**
	 * Called when an LLM run encounters an error.
	 * Registers the error and logs the AI error event.
	 */
	async handleLLMError(
		error: IDataObject | Error,
		runId: string,
		parentRunId?: string,
	): Promise<void> {
		const runDetails = this.runsMap[runId] ?? { index: Object.keys(this.runsMap).length };

		// Filter out non-x- headers to avoid leaking sensitive information in logs
		if (typeof error === 'object' && 'headers' in error) {
			const errorWithHeaders = error as { headers: Record<string, unknown> };
			if (errorWithHeaders.headers && typeof errorWithHeaders.headers === 'object') {
				Object.keys(errorWithHeaders.headers).forEach((key) => {
					if (!key.startsWith('x-')) {
						delete errorWithHeaders.headers[key];
					}
				});
			}
		}

		if (error instanceof NodeError) {
			if (this.options.errorDescriptionMapper) {
				error.description = this.options.errorDescriptionMapper(error);
			}

			this.executionFunctions.addOutputData(this.connectionType, runDetails.index, error);
		} else {
			// If the error is not a NodeError, wrap it in a NodeOperationError
			this.executionFunctions.addOutputData(
				this.connectionType,
				runDetails.index,
				new NodeOperationError(this.executionFunctions.getNode(), error as JsonObject, {
					functionality: 'configuration-node',
				}),
			);
		}

		logAiEvent(this.executionFunctions, 'ai-llm-errored', {
			error: Object.keys(error).length === 0 ? error.toString() : (error as IDataObject),
			runId,
			parentRunId,
		});
	}

	/**
	 * Used to associate subsequent runs with the correct parent run in subnodes of subnodes.
	 */
	setParentRunIndex(runIndex: number): void {
		this.#parentRunIndex = runIndex;
	}
}
