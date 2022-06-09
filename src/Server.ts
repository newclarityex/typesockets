export default function createServer<T extends { [key: string]: Function }>(endpoints: T) {
    return {
        endpoints,
    }
}