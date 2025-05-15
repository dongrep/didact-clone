export type UnitOfWork = {
  dom: Text | HTMLElement;
  props: Record<string, any>;
};

type FiberType = string | "TEXT_ELEMENT" | null;

export type Fiber = {
  type: FiberType;
  props: Record<string, any>;
  parent: Fiber | null;
  dom: Text | HTMLElement | null;
  child?: Fiber | null;
  sibling?: Fiber | null;
};
