import { cpus } from "os";
import { exec } from "child_process";

export class ProcessPoolExecutor {
  private static cpuCounts = cpus().length;
  private static deferedCmds: {
    cmd: string,
    resolveFn: any,
    rejectFn: any,
  }[] = [];
  private static usedCpus = 0;

  static execute = async (cmd: string, resolveCb?, rejectCb?) =>
    new Promise((...args) => {
      let resolve;
      let reject;

      if (resolveCb && rejectCb) {
        resolve = resolveCb;
        reject = rejectCb;
      } else {
        resolve = args[0];
        reject = args[1];
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
              firstDeferedCmd.resolveFn,
              firstDeferedCmd.rejectFn,
            );
          }
        });
      } else {
        ProcessPoolExecutor.deferedCmds.push({
          cmd,
          resolveFn: resolve,
          rejectFn: reject,
        });
      }
    });
}
