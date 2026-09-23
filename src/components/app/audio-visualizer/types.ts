export interface ConfigFieldsProps<T> {
  config: T;
  onChange: (partial: Partial<T>) => void;
}
