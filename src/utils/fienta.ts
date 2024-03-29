import { useStorage } from "@vueuse/core";
import { uniqueCollection } from "elektro";
import { $fetch } from "ohmyfetch";
import { config } from "./config";

type TicketStatus = "FREE" | "REQUIRES_TICKET" | "HAS_TICKET";

// We do not have proper types for events yet
// so we accept any object with "fienta_id" key
export type Ticketable = {
  fienta_id?: string;
  [key: string]: any;
};

type Ticket = {
  code: string;
  fientaid: string;
};

// Ticket local storage
// Security by obscurity

const tickets = useStorage<Ticket[]>("elektron_data", []);

// Fienta API client instance

const fienta = $fetch.create({
  baseURL: config.fientaUrl as string,
  headers: { Authorization: `Bearer ${config.fientaToken}` },
});

// Internal functions

function getLocalTicket(code: string): Ticket | undefined {
  return tickets.value?.find((ticket) => ticket.code == code);
}

function setLocalTicket(code: string, fienta_id: string) {
  tickets.value = uniqueCollection(
    [
      ...tickets.value,
      {
        code: code,
        fientaid: fienta_id,
      },
    ],
    "code",
  );
}

async function getRemoteTicket(
  code: string,
): Promise<{ fienta_status: string; fienta_id: string } | null> {
  try {
    const res: any = await fienta(`tickets/${code}`);
    if (res && res.ticket) {
      return {
        fienta_status: res.ticket.status, // TODO: type Fienta statuses
        fienta_id: res.ticket.event_id,
      };
    }
    return null;
  } catch {
    return null;
  }
  // TODO: return { status: FientaStatus, ticketable: Ticketable }
}

async function getTicketable(fienta_id: string): Promise<Ticketable | null> {
  const fientaQuery = (fienta_id: string) =>
    `_where[_or][0][fienta_id]=${fienta_id}&_where[_or][1][festival.fienta_id]=${fienta_id}`;

  try {
    // TODO: strapi client instance
    const events: Ticketable[] = await $fetch(
      `${config.strapiUrl}/events?${fientaQuery(fienta_id)}`,
    );
    if (events.length) {
      // TODO: What is the right thing to do
      // on multiple results?
      return events[0];
    }
  } catch {
    return null;
  }
  return null;
  // TODO: return { status: StapiStatus, ticketable: Ticketable }
}

// Exported API

// We support multiple fienta IDs per content
// for parent <> child tickets

export function getTicketableStatus(ticketables: Ticketable[]) {
  let status: TicketStatus = "FREE";

  const ticketablesRequiringTickets = ticketables.filter(
    (ticketable) => ticketable.fienta_id,
  );

  if (ticketablesRequiringTickets.length) {
    status = "REQUIRES_TICKET";
  }

  const ticketsForTicketables = ticketablesRequiringTickets.flatMap(
    (ticketable) =>
      tickets.value.filter((t) => t.fientaid == ticketable.fienta_id),
  );

  if (ticketsForTicketables.length) {
    status = "HAS_TICKET";
  }

  // TODO: Return { status: TicketStatus, url } where
  // url is link to Fienta ticket-purchasing page
  return status;
}

export async function validateTicket(code: string): Promise<Ticketable | null> {
  const localTicket = getLocalTicket(code);
  if (localTicket) {
    const ticketable = await getTicketable(localTicket.fientaid);
    if (ticketable) {
      return ticketable;
    }
    // TODO: Handle the case when you have validated ticket to
    // non-existing ticketable (event), currently we just return null
  } else {
    const remoteTicket = await getRemoteTicket(code);
    if (remoteTicket) {
      const ticketable = await getTicketable(remoteTicket.fienta_id);
      if (ticketable) {
        setLocalTicket(code, remoteTicket.fienta_id);
        return ticketable;
      }
      // TODO: Handle the case when you have nonvalidated ticket to
      // non-existing ticketable (event), currently we just return null
    }
  }
  // TODO: Return {
  //  status: TicketValidationStatus,
  //  ticketable: Ticketable,
  //  url: string
  // }
  // where url is `https://live.elektron.art/${festivalslug}/${eventslug}?code=${code}&fienta_id=${fienta_id}`
  return null;
}
