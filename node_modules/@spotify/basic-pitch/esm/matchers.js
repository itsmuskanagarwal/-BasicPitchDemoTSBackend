export const toAllBeClose = (received, argument, atol = 1e-3, rtol = 1e-5) => {
    if (received === undefined) {
        return {
            pass: false,
            message: () => `Received must be number[] ` + `Received is ${received}. `,
        };
    }
    if (argument === undefined) {
        return {
            pass: false,
            message: () => `Argument must be number[]. ` + `Received is ${argument}. `,
        };
    }
    if (received.length !== argument.length) {
        return {
            pass: false,
            message: () => `Received and expected lengths do not match! ` +
                `Received has length ${received.length}. ` +
                `Expected has length ${argument.length}.`,
        };
    }
    for (let i = 0; i < received.length; ++i) {
        if (Math.abs(received[i] - argument[i]) >
            atol + rtol * Math.abs(received[i])) {
            return {
                pass: false,
                message: () => `Expected all number elements in ${JSON.stringify(received.slice(Math.max(0, i - 5), Math.min(received.length - 1, i + 5)), null, '  ')} ` +
                    `to be close to ${JSON.stringify(argument.slice(Math.max(0, i - 5), Math.min(argument.length - 1, i + 5)), null, '  ')} ` +
                    `(this is a slice of the data at the location + -5 elements). ` +
                    `${received[i]} != ${argument[i]} at index ${i}.`,
            };
        }
    }
    return {
        pass: true,
        message: () => ``,
    };
};
expect.extend({
    toAllBeClose,
});
//# sourceMappingURL=matchers.js.map