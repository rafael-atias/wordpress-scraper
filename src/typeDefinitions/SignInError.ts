export default class SignInError extends Error {
    name: string;
    message: string;
    stack?: string;

    constructor(message: string, stack?: string) {
        super();
        this.name = "SignInError";
        this.message = message;
        this.stack = stack;
    }
}