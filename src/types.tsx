type EffectTag = "UPDATE" | "DELETE" | "PLACEMENT";
type FiberType = Function | string | "TEXT_ELEMENT" | null;

export type Dom = Text | HTMLElement | null;
export type Hook = {
  state: any;
  queue: Function[];
};

export type Fiber = {
  type: FiberType;
  props: Record<string, any>;
  parent: Fiber | null;
  dom: Dom;
  child?: Fiber | null;
  sibling?: Fiber | null;
  alternate?: Fiber | null;
  effectTag?: EffectTag;
  hooks?: Hook[];
};
