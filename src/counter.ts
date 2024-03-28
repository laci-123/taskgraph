export class Counter
{
    constructor(private value: number)
    {}

    get_value(): number
    {
        return this.value;
    }

    increase(amount: number)
    {
        this.value += amount;
    }

    decrease(amount: number)
    {
        this.value -= amount;
    }
}
