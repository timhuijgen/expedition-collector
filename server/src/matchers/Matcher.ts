export default abstract class Matcher {
    abstract matcher: RegExp | RegExp[];

    public match(content: string): boolean | number {
        if(Array.isArray(this.matcher)) {
            return this.matcher.some(match => match.test(content));
        }
        return this.matcher.test(content);
    }

    public getValue(content: string): number {
        return 0;
    }
}