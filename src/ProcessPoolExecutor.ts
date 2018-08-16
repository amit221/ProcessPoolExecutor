import { cpus } from "os";
import { exec } from "child_process";

type IResolveFn = (buffer: IBufferOutput) => void;
type IRejectFn = (err: Error) => void;

interface IBufferOutput {
    stdout: string;
    stderr: string;
}

interface IDeferedCmd {
  cmd: string,
  name: string,
  resolveFn: any,
  rejectFn: any,
}

export class ProcessPoolExecutor {
  private static cpuCounts = cpus().length;
  private static deferedCmds: IDeferedCmd[] = [];
  private static usedCpus = 0;

  static execute = async (cmd: string, name: string, resolveCb?: IResolveFn, rejectCb?: IRejectFn) =>
    new Promise((resolveArg, rejectArg) => {
      let resolve: IResolveFn;
      let reject: IRejectFn;

      if (resolveCb && rejectCb) {
        resolve = resolveCb;
        reject = rejectCb;
      } else {
        resolve = resolveArg;
        reject = rejectArg;
      }

      if (ProcessPoolExecutor.usedCpus < ProcessPoolExecutor.cpuCounts) {
        ProcessPoolExecutor.usedCpus++;
        exec(cmd, async (err, stdout, stderr) => {
          if (err) {
            reject(err);
          }

          ProcessPoolExecutor.usedCpus--;
          resolve({
            stdout,
            stderr,
          });
          
          if(ProcessPoolExecutor.deferedCmds.length > 0) {
            const [firstDeferedCmd, ...rest] = ProcessPoolExecutor.deferedCmds;
            ProcessPoolExecutor.deferedCmds = rest.slice();
            ProcessPoolExecutor.execute(
              firstDeferedCmd.cmd,
              firstDeferedCmd.name,
              firstDeferedCmd.resolveFn,
              firstDeferedCmd.rejectFn,
            );
          }
        });
      } else {
        ProcessPoolExecutor.deferedCmds.push({
          cmd,
          name,
          resolveFn: resolve,
          rejectFn: reject,
        });
      }
    });
}
