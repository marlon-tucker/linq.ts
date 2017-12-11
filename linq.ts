import { List, Range, Repeat, Set } from 'immutable'

/**
 * LinQ to TypeScript
 *
 * Documentation from LinQ .NET specification (https://msdn.microsoft.com/en-us/library/system.linq.enumerable.aspx)
 *
 * Created by Flavio Corpa (@kutyel)
 * Copyright © 2016 Flavio Corpa. All rights reserved.
 *
 */
export class Enumerable<T> {
  protected _elements: List<T>

  /**
   * Defaults the elements of the list
   */
  constructor(elements: T[] = []) {
    this._elements = List(elements)
  }

  /**
   * Adds an object to the end of the List<T>.
   */
  public Add(element: T): void {
    this._elements.push(element)
  }

  /**
   * Adds the elements of the specified collection to the end of the List<T>.
   */
  public AddRange(elements: T[]): void {
    this._elements.push(...elements)
  }

  /**
   * Applies an accumulator function over a sequence.
   */
  public Aggregate<U>(
    accumulator: (accum: U, value?: T, index?: number) => U,
    initialValue?: U
  ): any {
    return this._elements.reduce(accumulator, initialValue)
  }

  /**
   * Determines whether all elements of a sequence satisfy a condition.
   */
  public All(predicate: (value?: T, index?: number) => boolean): boolean {
    return this._elements.every(predicate)
  }

  /**
   * Determines whether a sequence contains any elements.
   */
  public Any(): boolean
  public Any(predicate: (value?: T, index?: number) => boolean): boolean
  public Any(predicate?: (value?: T, index?: number) => boolean): boolean {
    return predicate ? this._elements.some(predicate) : this._elements.size > 0
  }

  /**
   * Computes the average of a sequence of number values that are obtained by invoking
   * a transform function on each element of the input sequence.
   */
  public Average(): number
  public Average(transform: (value?: T, index?: number) => any): number
  public Average(transform?: (value?: T, index?: number) => any): number {
    return this.Sum(transform) / this.Count(transform)
  }

  /**
   * Casts the elements of a sequence to the specified type.
   */
  public Cast<U>(): Enumerable<U> {
    return new Enumerable<U>(this._elements as any)
  }

  /**
   * Concatenates two sequences.
   */
  public Concat(list: Enumerable<T>): Enumerable<T> {
    return new Enumerable([...this._elements.toJS(), ...list._elements.toJS()])
  }

  /**
   * Determines whether an element is in the List<T>.
   */
  public Contains(element: T): boolean {
    return this._elements.includes(element)
  }

  /**
   * Returns the number of elements in a sequence.
   */
  public Count(): number
  public Count(predicate: (value?: T, index?: number) => boolean): number
  public Count(predicate?: (value?: T, index?: number) => boolean): number {
    return predicate ? this.Where(predicate).Count() : this._elements.size
  }

  /**
   * Returns the elements of the specified sequence or the type parameter's default value
   * in a singleton collection if the sequence is empty.
   */
  public DefaultIfEmpty(defaultValue?: T): Enumerable<T> {
    return this.Count() ? this : new Enumerable<T>([defaultValue])
  }

  /**
   * Returns distinct elements from a sequence by using the default equality comparer to compare values.
   */
  public Distinct(): Enumerable<T> {
    return new Enumerable(Set(this._elements).toArray())
  }

  /**
   * Returns distinct elements from a sequence according to specified key selector.
   */
  public DistinctBy(keySelector: (key: T) => any): Enumerable<T> {
    const groups = this.GroupBy(keySelector, obj => obj)
    return Object.keys(groups).reduce((results, key) => {
      results.Add(groups[key][0])
      return results
    }, new Enumerable<T>())
  }

  /**
   * Returns the element at a specified index in a sequence.
   */
  public ElementAt(index: number): T {
    if (index < this.Count()) {
      return this._elements.get(index)
    } else {
      const MSG =
        'ArgumentOutOfRangeException: index is less than 0 or greater than or equal to the number of elements in source.'
      throw new Error(MSG)
    }
  }

  /**
   * Returns the element at a specified index in a sequence or a default value if the index is out of range.
   */
  public ElementAtOrDefault(index: number): T {
    return this.ElementAt(index) || undefined
  }

  /**
   * Produces the set difference of two sequences by using the default equality comparer to compare values.
   */
  public Except(source: Enumerable<T>): Enumerable<T> {
    return this.Where(x => !source.Contains(x))
  }

  /**
   * Returns the first element of a sequence.
   */
  public First(): T
  public First(predicate: (value?: T, index?: number, list?: T[]) => boolean): T
  public First(
    predicate?: (value?: T, index?: number, list?: T[]) => boolean
  ): T {
    if (this.Count()) {
      return predicate ? this.Where(predicate).First() : this._elements.first()
    } else {
      throw new Error(
        'InvalidOperationException: The source sequence is empty.'
      )
    }
  }

  /**
   * Returns the first element of a sequence, or a default value if the sequence contains no elements.
   */
  public FirstOrDefault(): T
  public FirstOrDefault(
    predicate: (value?: T, index?: number, list?: T[]) => boolean
  ): T
  public FirstOrDefault(
    predicate?: (value?: T, index?: number, list?: T[]) => boolean
  ): T {
    return this.Count(predicate) ? this.First(predicate) : undefined
  }

  /**
   * Performs the specified action on each element of the List<T>.
   */
  public ForEach(action: (value?: T, index?: number) => any): void {
    this._elements.forEach(action)
  }

  /**
   * Groups the elements of a sequence according to a specified key selector function.
   */
  public GroupBy(grouper: (key: T) => any, mapper: (element: T) => any): any {
    return this.Aggregate(
      (ac, v) => (
        (ac as any)[grouper(v)]
          ? (ac as any)[grouper(v)].push(mapper(v))
          : ((ac as any)[grouper(v)] = [mapper(v)]),
        ac
      ),
      {}
    )
  }

  /**
   * Correlates the elements of two sequences based on equality of keys and groups the results.
   * The default equality comparer is used to compare keys.
   */
  public GroupJoin<U>(
    list: Enumerable<U>,
    key1: (k: T) => any,
    key2: (k: U) => any,
    result: (first: T, second: Enumerable<U>) => any
  ): Enumerable<any> {
    return this.Select((x, y) =>
      result(x, list.Where(z => key1(x) === key2(z)))
    )
  }

  /**
   * Returns the index of the first occurence of an element in the List.
   */
  public IndexOf(element: T): number {
    return this._elements.indexOf(element)
  }

  /**
   * Inserts an element into the List<T> at the specified index.
   */
  public Insert(index: number, element: T): void | Error {
    if (index < 0 || index > this._elements.size) {
      throw new Error('Index is out of range.')
    }

    this._elements.splice(index, 0, element)
  }

  /**
   * Produces the set intersection of two sequences by using the default equality comparer to compare values.
   */
  public Intersect(source: Enumerable<T>): Enumerable<T> {
    return this.Where(x => source.Contains(x))
  }

  /**
   * TODO: Correlates the elements of two sequences based on matching keys. The default equality comparer is used to compare keys.
   */
  // public Join<U>(
  //   list: Enumerable<U>,
  //   key1: (key: T) => any,
  //   key2: (key: U) => any,
  //   result: (first: T, second: U) => any
  // ): Enumerable<any> {
  //   return this.SelectMany(x =>
  //     list.Where(y => key2(y) === key1(x)).Select(z => result(x, z))
  //   )
  // }

  /**
   * Returns the last element of a sequence.
   */
  public Last(): T
  public Last(predicate: (value?: T, index?: number, list?: T[]) => boolean): T
  public Last(
    predicate?: (value?: T, index?: number, list?: T[]) => boolean
  ): T {
    if (this.Count()) {
      return predicate
        ? this.Where(predicate).Last()
        : this._elements[this.Count() - 1]
    } else {
      throw Error('InvalidOperationException: The source sequence is empty.')
    }
  }

  /**
   * Returns the last element of a sequence, or a default value if the sequence contains no elements.
   */
  public LastOrDefault(): T
  public LastOrDefault(
    predicate: (value?: T, index?: number, list?: T[]) => boolean
  ): T
  public LastOrDefault(
    predicate?: (value?: T, index?: number, list?: T[]) => boolean
  ): T {
    return this.Count(predicate) ? this.Last(predicate) : undefined
  }

  /**
   * Returns the maximum value in a generic sequence.
   */
  public Max(): T {
    return this.Aggregate((x, y) => (x > y ? x : y))
  }

  /**
   * Returns the minimum value in a generic sequence.
   */
  public Min(): T {
    return this.Aggregate((x, y) => (x < y ? x : y))
  }

  /**
   * Filters the elements of a sequence based on a specified type.
   */
  public OfType<U>(type: any): Enumerable<U> {
    let typeName
    switch (type) {
      case Number:
        typeName = typeof 0
        break
      case String:
        typeName = typeof ''
        break
      case Boolean:
        typeName = typeof true
        break
      case Function:
        typeName = typeof function() {} // tslint:disable-line no-empty
        break
      default:
        typeName = null
        break
    }
    return typeName === null
      ? this.Where(x => x instanceof type).Cast<U>()
      : this.Where(x => typeof x === typeName).Cast<U>()
  }

  /**
   * Sorts the elements of a sequence in ascending order according to a key.
   */
  public OrderBy(keySelector: (key: T) => any): Enumerable<T> {
    return new OrderedList<T>(
      this._elements.toJS(),
      ComparerHelper.ComparerForKey(keySelector, false)
    )
  }

  /**
   * Sorts the elements of a sequence in descending order according to a key.
   */
  public OrderByDescending(keySelector: (key: T) => any): Enumerable<T> {
    return new OrderedList<T>(
      this._elements.toJS(),
      ComparerHelper.ComparerForKey(keySelector, true)
    )
  }

  /**
   * Performs a subsequent ordering of the elements in a sequence in ascending order according to a key.
   */
  public ThenBy(keySelector: (key: T) => any): Enumerable<T> {
    return this.OrderBy(keySelector)
  }

  /**
   * Performs a subsequent ordering of the elements in a sequence in descending order, according to a key.
   */
  public ThenByDescending(keySelector: (key: T) => any): Enumerable<T> {
    return this.OrderByDescending(keySelector)
  }

  /**
   * Generates a sequence of integral numbers within a specified range.
   */
  public static Range(
    start?: number,
    count?: number,
    step?: number
  ): Enumerable<number> {
    return new Enumerable(Range(start, count, step).toJS())
  }

  /**
   * Removes the first occurrence of a specific object from the List<T>.
   */
  public Remove(element: T): boolean {
    return this.IndexOf(element) !== -1
      ? (this.RemoveAt(this.IndexOf(element)), true)
      : false
  }

  /**
   * Removes all the elements that match the conditions defined by the specified predicate.
   */
  public RemoveAll(
    predicate: (value?: T, index?: number, list?: T[]) => boolean
  ): Enumerable<T> {
    return this.Where(this._negate(predicate))
  }

  /**
   * Removes the element at the specified index of the List<T>.
   */
  public RemoveAt(index: number): void {
    this._elements.splice(index, 1)
  }

  /**
   * Generates a sequence that contains one repeated value.
   */
  public static Repeat<T>(element: T, count: number): Enumerable<T> {
    return new Enumerable(Repeat(element, count).toJS())
  }

  /**
   * Reverses the order of the elements in the entire List<T>.
   */
  public Reverse(): Enumerable<T> {
    this._elements.reverse()
    return this
  }

  /**
   * Projects each element of a sequence into a new form.
   */
  public Select<TOut>(
    mapper: (value?: T, index?: number) => TOut
  ): Enumerable<TOut> {
    return new Enumerable<any>(this._elements.map(mapper).toJS())
  }

  /**
   * Projects each element of a sequence to a List<any> and flattens the resulting sequences into one sequence.
   */
  public SelectMany<TOut extends List<any>>(
    mapper: (value?: T, index?: number) => TOut
  ): TOut {
    return this.Aggregate(
      (ac, v, i) => (ac.Add(this.Select(mapper).ElementAt(i)), ac),
      new Enumerable<TOut>()
    )
  }

  /**
   * Determines whether two sequences are equal by comparing the elements by using the default equality comparer for their type.
   */
  public SequenceEqual(list: Enumerable<T>): boolean {
    return this._elements.equals(list._elements)
  }

  /**
   * Returns the only element of a sequence, and throws an exception if there is not exactly one element in the sequence.
   */
  public Single(
    predicate?: (value?: T, index?: number, list?: T[]) => boolean
  ): T {
    if (this.Count(predicate) !== 1) {
      throw new Error('The collection does not contain exactly one element.')
    } else {
      return this.First(predicate)
    }
  }

  /**
   * Returns the only element of a sequence, or a default value if the sequence is empty;
   * this method throws an exception if there is more than one element in the sequence.
   */
  public SingleOrDefault(
    predicate?: (value?: T, index?: number, list?: T[]) => boolean
  ): T {
    return this.Count(predicate) ? this.Single(predicate) : undefined
  }

  /**
   * Bypasses a specified number of elements in a sequence and then returns the remaining elements.
   */
  public Skip(amount: number): Enumerable<T> {
    this._elements.skip(amount)
    return this
  }

  /**
   * Bypasses elements in a sequence as long as a specified condition is true and then returns the remaining elements.
   */
  public SkipWhile(
    predicate: (value?: T, index?: number, list?: T[]) => boolean
  ): Enumerable<T> {
    return this.Skip(
      this.Aggregate(
        (ac, val) => (predicate(this.ElementAt(ac)) ? ++ac : ac),
        0
      )
    )
  }

  /**
   * Computes the sum of the sequence of number values that are obtained by invoking
   * a transform function on each element of the input sequence.
   */
  public Sum(): number
  public Sum(
    transform: (value?: T, index?: number, list?: T[]) => number
  ): number
  public Sum(
    transform?: (value?: T, index?: number, list?: T[]) => number
  ): number {
    return transform
      ? this.Select(transform).Sum()
      : this.Aggregate((ac, v) => (ac += +v), 0)
  }

  /**
   * Returns a specified number of contiguous elements from the start of a sequence.
   */
  public Take(amount: number): Enumerable<T> {
    return new Enumerable(this._elements.take(amount).toJS())
  }

  /**
   * Returns elements from a sequence as long as a specified condition is true.
   */
  public TakeWhile(
    predicate: (value?: T, index?: number) => boolean
  ): Enumerable<T> {
    return new Enumerable(this._elements.takeWhile(predicate).toJS())
  }

  /**
   * Turns the elements of the List<T> into a native JavaScript Array<T>.
   */
  public ToArray(): T[] {
    return this._elements.toJS()
  }

  /**
   * Creates a Dictionary<TKey, TValue> from a List<T> according to a specified key selector function.
   */
  public ToDictionary<TKey>(key: (key: T) => TKey): { [id: string]: T }
  public ToDictionary<TKey, TValue>(
    key: (key: T) => TKey,
    value: (value: T) => TValue
  ): { [id: string]: TValue }
  public ToDictionary<TKey, TValue>(
    key: (key: T) => TKey,
    value?: (value: T) => TValue
  ): { [id: string]: TValue | T } {
    return this.Aggregate(
      (o, v, i) => (
        ((o as any)[
          this.Select(key)
            .ElementAt(i)
            .toString()
        ] = value ? this.Select(value).ElementAt(i) : v),
        o
      ),
      {}
    )
  }

  /**
   * Creates a List<T> from an Enumerable.List<T>.
   */
  public ToList(): Enumerable<T> {
    return this
  }

  /**
   * Creates a Lookup<TKey, TElement> from an IEnumerable<T> according to specified key selector and element selector functions.
   */
  public ToLookup(
    keySelector: (key: T) => any,
    elementSelector: (element: T) => any
  ): any {
    return this.GroupBy(keySelector, elementSelector)
  }

  /**
   * Produces the set union of two sequences by using the default equality comparer.
   */
  public Union(list: Enumerable<T>): Enumerable<T> {
    return this.Concat(list).Distinct()
  }

  /**
   * Filters a sequence of values based on a predicate.
   */
  public Where(
    predicate: (value?: T, index?: number) => boolean
  ): Enumerable<T> {
    return new Enumerable<T>([...this._elements.filter(predicate).toJS()])
  }

  /**
   * Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
   */
  public Zip<U, TOut>(
    list: Enumerable<U>,
    result: (first: T, second: U) => TOut
  ): Enumerable<TOut> {
    return list.Count() < this.Count()
      ? list.Select((x, y) => result(this.ElementAt(y), x))
      : this.Select((x, y) => result(x, list.ElementAt(y)))
  }

  /**
   * Creates a function that negates the result of the predicate
   */
  private _negate(
    predicate: (value?: T, index?: number, list?: T[]) => boolean
  ): () => any {
    return function(): any {
      return !predicate.apply(this, arguments)
    }
  }
}

class ComparerHelper {
  public static ComparerForKey<T>(
    _keySelector: (key: T) => any,
    descending?: boolean
  ): (a: T, b: T) => number {
    return (a: T, b: T) => {
      return ComparerHelper.Compare(a, b, _keySelector, descending)
    }
  }

  public static Compare<T>(
    a: T,
    b: T,
    _keySelector: (key: T) => any,
    descending?: boolean
  ): number {
    const sortKeyA = _keySelector(a)
    const sortKeyB = _keySelector(b)
    if (sortKeyA > sortKeyB) {
      return !descending ? 1 : -1
    } else if (sortKeyA < sortKeyB) {
      return !descending ? -1 : 1
    } else {
      return 0
    }
  }

  public static ComposeComparers<T>(
    previousComparer: (a: T, b: T) => number,
    currentComparer: (a: T, b: T) => number
  ): (a: T, b: T) => number {
    return (a: T, b: T) => {
      let resultOfPreviousComparer = previousComparer(a, b)
      if (!resultOfPreviousComparer) {
        return currentComparer(a, b)
      } else {
        return resultOfPreviousComparer
      }
    }
  }
}

/**
 * Represents a sorted sequence. The methods of this class are implemented by using deferred execution.
 * The immediate return value is an object that stores all the information that is required to perform the action.
 * The query represented by this method is not executed until the object is enumerated either by
 * calling its ToDictionary, ToLookup, ToList or ToArray methods
 */
class OrderedList<T> extends Enumerable<T> {
  constructor(elements: T[], private _comparer: (a: T, b: T) => number) {
    super(elements)
    this._elements.sort(this._comparer)
  }

  /**
   * Performs a subsequent ordering of the elements in a sequence in ascending order according to a key.
   * @override
   */
  public ThenBy(keySelector: (key: T) => any): Enumerable<T> {
    return new OrderedList(
      this._elements.toJS(),
      ComparerHelper.ComposeComparers(
        this._comparer,
        ComparerHelper.ComparerForKey(keySelector, false)
      )
    )
  }

  /**
   * Performs a subsequent ordering of the elements in a sequence in descending order, according to a key.
   * @override
   */
  public ThenByDescending(keySelector: (key: T) => any): Enumerable<T> {
    return new OrderedList(
      this._elements.toJS(),
      ComparerHelper.ComposeComparers(
        this._comparer,
        ComparerHelper.ComparerForKey(keySelector, true)
      )
    )
  }
}
