import {cpus} from "os";
import {exec} from "child_process";
import {Error} from "tslint/lib/error";

const execPromise = cmd => {
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                return reject(err);
            }
            resolve({stdout, stderr});
        });
    });
};


type IResolveFn = (buffer: IBufferOutput) => void;
type IRejectFn = (err: Error) => void;

interface IBufferOutput {
    stdout: string;
    stderr: string;
}

interface IDeferedCmd {
    type: string,
    cmd: string,
    name: string,
    resolve: IResolveFn,
    reject: IRejectFn

}

export class ProcessPoolExecutor {
    private static cpuCounts = cpus().length;
    private static deferedCmds: IDeferedCmd[] = [];
    private static usedCpus = 0;

    private static nextCmd = () => {
        console.log(ProcessPoolExecutor.usedCpus,ProcessPoolExecutor.deferedCmds.length);
        ProcessPoolExecutor.usedCpus--;
        if (ProcessPoolExecutor.deferedCmds.length > 0) {
            const firstDeferedCmd = ProcessPoolExecutor.deferedCmds.pop();
            ProcessPoolExecutor[firstDeferedCmd.type](firstDeferedCmd);
        }
    };

    static execute = async ({cmd, name}: { cmd: string, name: string }) => {

        if (ProcessPoolExecutor.usedCpus < ProcessPoolExecutor.cpuCounts) {
            ProcessPoolExecutor.usedCpus++;
            try {
                const results = await execPromise(cmd);
                ProcessPoolExecutor.nextCmd();
                return results;
            }
            catch (err) {
                ProcessPoolExecutor.nextCmd();
                throw err;
            }
        }

        const deferedCmdPromise = new Promise((resolve, reject) => {
            ProcessPoolExecutor.deferedCmds.push({
                type: "execute",
                cmd,
                name,
                resolve,
                reject
            });
        });

        return deferedCmdPromise;


    };


}
