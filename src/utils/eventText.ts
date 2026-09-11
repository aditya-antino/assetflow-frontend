import { AssetEvent } from "../types";

export function describeEvent(event: AssetEvent): string {
  const assetTag = event.asset?.assetTag ?? "an asset";

  switch (event.eventType) {
    case "PURCHASED":
      return `${assetTag} was added to inventory`;
    case "ASSIGNED":
      return `${event.toUser?.name ?? "Someone"} was assigned ${assetTag}`;
    case "RETURNED":
      return `${event.fromUser?.name ?? "Someone"} returned ${assetTag}`;
    case "REPAIR_STARTED":
      return `${assetTag} moved to repair`;
    case "REPAIR_COMPLETED":
      return `${assetTag} repair completed`;
    case "RETIRED":
      return `${assetTag} was retired`;
    default:
      return `${assetTag} updated`;
  }
}

export function eventTitle(event: AssetEvent): string {
  switch (event.eventType) {
    case "PURCHASED":
      return "Asset purchased";
    case "ASSIGNED":
      return `Assigned to ${event.toUser?.name ?? "employee"}`;
    case "RETURNED":
      return `Returned by ${event.fromUser?.name ?? "employee"}`;
    case "REPAIR_STARTED":
      return "Repair started";
    case "REPAIR_COMPLETED":
      return "Repair completed";
    case "RETIRED":
      return "Asset retired";
    default:
      return event.eventType;
  }
}
