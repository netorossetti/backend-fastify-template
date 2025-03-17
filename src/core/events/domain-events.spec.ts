import { AggregateRoot } from "../entities/aggregate-root";
import { DomainEvent } from "./domain-event";
import { DomainEvents } from "./domain-events";
import { vi } from "vitest";

class CustomAggregateCreated implements DomainEvent {
  public ocurredAt: Date;

  private aggregate: CustomAggregate;

  constructor(aggregate: CustomAggregate) {
    this.aggregate = aggregate;
    this.ocurredAt = new Date();
  }

  public getAggregateId() {
    return this.aggregate.id;
  }
}

class CustomAggregate extends AggregateRoot<null> {
  static create() {
    const aggregate = new CustomAggregate(null, 1);

    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate));

    return aggregate;
  }
}

class CustomAggregateDois extends AggregateRoot<null> {
  static create() {
    const aggregate = new CustomAggregateDois(null, 1);

    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate));

    return aggregate;
  }
}

describe("Domain Events", () => {
  test("deve ser possivel disparar e ler eventos", async () => {
    const callcackSpy = vi.fn();

    // Subscriber cadastrado (ouvindo o evento de resposta criada)
    DomainEvents.register(callcackSpy, CustomAggregateCreated.name);

    // Estou criando uma resposta porem SEM salvar no banco
    const aggregate = CustomAggregate.create();
    const aggregateDois = CustomAggregateDois.create();

    // Estou assegurando que o evento foi criado porem não foi disparado
    expect(aggregate.domainEvents).toHaveLength(1);
    expect(aggregateDois.domainEvents).toHaveLength(1);

    // Estou salvando a resposta no banco de dados e assim disparando o evento
    DomainEvents.dispatchEventsForAggregate(aggregate);
    DomainEvents.dispatchEventsForAggregate(aggregateDois);

    // O subscriber ouve o evento e faz o que precisa ser feito com o dado
    expect(callcackSpy).toHaveBeenCalled;
    expect(aggregate.domainEvents).toHaveLength(0);
  });
});
