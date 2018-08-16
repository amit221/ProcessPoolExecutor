interface IBufferOutput {
    stdout: string;
    stderr: string;
}

type IResolveFn = (buffer: IBufferOutput) => void;
type IRejectFn = (err: Error) => void;

declare class ProcessPoolExecutor {
    static execute(cmd: string, name: string, resolveCb?: IResolveFn, rejectCb?: IRejectFn): Promise<{
        stdout: string;
        stderr: string;
    }>
}

export { ProcessPoolExecutor };
