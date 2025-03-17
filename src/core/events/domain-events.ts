import { AggregateRoot } from "../entities/aggregate-root";
import { DomainEvent } from "./domain-event";

type DomainEventCallback = (event: unknown) => void;

interface MarkedAggregates {
  name: string;
  aggregate: AggregateRoot<unknown>;
}
//this.constructor.name

export class DomainEvents {
  private static handlersMap: Record<string, DomainEventCallback[]> = {};
  private static markedAggregates: MarkedAggregates[] = [];

  public static shouldRun = true;

  public static markAggregateForDispatch(aggregate: AggregateRoot<unknown>) {
    if (!aggregate.id) throw new Error("Error to mark for dispach event");
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate);

    if (!aggregateFound) {
      this.markedAggregates.push({
        name: aggregate.constructor.name,
        aggregate,
      });
    }
  }

  private static dispatchAggregateEvents(aggregate: AggregateRoot<unknown>) {
    aggregate.domainEvents.forEach((event: DomainEvent) =>
      this.dispatch(event)
    );
  }

  private static removeAggregateFromMarkedDispatchList(
    aggregate: AggregateRoot<unknown>
  ) {
    const index = this.markedAggregates.findIndex((a) => {
      return a.name === aggregate.constructor.name && a.aggregate === aggregate;
    });

    this.markedAggregates.splice(index, 1);
  }

  private static findMarkedAggregateByID(
    aggregate: AggregateRoot<unknown>
  ): AggregateRoot<unknown> | undefined {
    if (!aggregate.id) return undefined;
    const index = this.markedAggregates.findIndex((a) => {
      return a.name === aggregate.constructor.name && a.aggregate === aggregate;
    });
    if (index === -1) return undefined;
    return this.markedAggregates[index].aggregate;
  }

  public static dispatchEventsForAggregate(aggregate: AggregateRoot<unknown>) {
    const findAggregate = this.findMarkedAggregateByID(aggregate);
    if (findAggregate) {
      this.dispatchAggregateEvents(findAggregate);
      findAggregate.clearEvents();
      this.removeAggregateFromMarkedDispatchList(findAggregate);
    }
  }

  public static register(
    callback: DomainEventCallback,
    eventClassName: string
  ) {
    const wasEventRegisteredBefore = eventClassName in this.handlersMap;

    if (!wasEventRegisteredBefore) {
      this.handlersMap[eventClassName] = [];
    }

    this.handlersMap[eventClassName].push(callback);
  }

  public static clearHandlers() {
    this.handlersMap = {};
  }

  public static clearMarkedAggregates() {
    this.markedAggregates = [];
  }

  private static dispatch(event: DomainEvent) {
    const eventClassName: string = event.constructor.name;

    const isEventRegistered = eventClassName in this.handlersMap;

    if (!this.shouldRun) return;

    if (isEventRegistered) {
      const handlers = this.handlersMap[eventClassName];

      for (const handler of handlers) {
        handler(event);
      }
    }
  }
}
