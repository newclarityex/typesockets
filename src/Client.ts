export default function createClient<T extends { [key: string]: Function }>(endpoints: T) {
    return {
        endpoints,
    }
}