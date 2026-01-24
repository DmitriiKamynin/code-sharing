export class WorkersService {
  constructor() {}

  runCode(code: string) {
    return eval(code);
  }
}
