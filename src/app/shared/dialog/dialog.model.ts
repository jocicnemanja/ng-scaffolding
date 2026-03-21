export interface DialogConfig {
  title: string;
  size?: 'sm' | 'md' | 'lg';
  /** Show an × close button in the header. Defaults to false. */
  closable?: boolean;
}
