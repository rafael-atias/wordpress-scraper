export default class UnknownUserError extends Error {
    name: string;
    message: string;
    stack?: string;

    constructor(message: string, stack?: string) {
        super();
        this.name = "UnknownUserError";
        this.message = message;
        this.stack = stack;
    }
}