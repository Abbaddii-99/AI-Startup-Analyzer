export interface AgentInterface {
  execute(idea: string, context?: any): Promise<any>;
}

export interface Agent<T> {
  execute(idea: string, context?: any): Promise<T>;
}
