import type { OrderDeliveryAddressDTO } from '../../types/orders';
import { formatCep } from '../../lib/format';

type Props = {
  address: OrderDeliveryAddressDTO | null | undefined;
};

/**
 * Verifica se o endereço tem ao menos um campo preenchido. A API pode
 * retornar `deliveryAddress` nulo ou com todos os campos vazios quando o
 * cliente não informou entrega.
 */
const hasAnyField = (address: OrderDeliveryAddressDTO) =>
  Object.values(address).some((value) => value && String(value).trim() !== '');

export function OrderDeliveryAddressCard({ address }: Props) {
  const isEmpty = !address || !hasAnyField(address);

  return (
    <section className="rounded-2xl border border-edge bg-surface p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Endereço de entrega
        </h2>
        <span className="text-sm">📦</span>
      </header>

      {isEmpty ? (
        <p className="text-[11px] text-faint">
          Nenhum endereço de entrega informado.
        </p>
      ) : (
        <AddressBody address={address} />
      )}
    </section>
  );
}

function AddressBody({ address }: { address: OrderDeliveryAddressDTO }) {
  /**
   * Linha 1: logradouro, número e complemento.
   * Linha 2: bairro.
   * Linha 3: cidade/UF.
   */
  const streetLine = [
    address.street,
    address.number,
    address.complement,
  ]
    .filter((part) => part && String(part).trim() !== '')
    .join(', ');

  const cityLine = [address.city, address.state]
    .filter((part) => part && String(part).trim() !== '')
    .join(' / ');

  return (
    <div className="flex flex-col gap-1 text-xs text-body">
      {streetLine && <span className="font-medium text-heading">{streetLine}</span>}
      {address.neighborhood && (
        <span className="text-[11px] text-muted">{address.neighborhood}</span>
      )}
      {cityLine && <span className="text-[11px] text-muted">{cityLine}</span>}
      {address.cep && (
        <span className="text-[11px] text-faint">
          CEP {formatCep(address.cep)}
        </span>
      )}
    </div>
  );
}
