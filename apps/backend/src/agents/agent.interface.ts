export interface Agent<T> {
  execute(idea: string, context?: any): Promise<T>;
}
