export type ActionForTest<T extends (...args: any) => any> = Omit<ReturnType<T>, "meta">
