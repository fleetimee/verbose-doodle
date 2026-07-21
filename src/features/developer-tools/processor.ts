/**
 * ToolProcessor Seam Interface
 * Standardized contract for developer tool data transformation and validation processors.
 */
export type ToolProcessorResult<TOutput> = {
  readonly success: boolean;
  readonly data?: TOutput;
  readonly error?: string;
};

export type ToolProcessor<TInput, TOutput> = {
  readonly id: string;
  readonly name: string;
  readonly process: (
    input: TInput
  ) => ToolProcessorResult<TOutput> | Promise<ToolProcessorResult<TOutput>>;
};
