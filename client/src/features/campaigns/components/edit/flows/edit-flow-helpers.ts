import type { Condition, ConditionGroup } from "@/types";

export function countFilledRules(group: ConditionGroup): number {
  return group.conditions.filter(
    (item): item is Condition =>
      "type" in item &&
      !("conditions" in item) &&
      String(item.value).trim() !== "",
  ).length;
}

export function formatCountBadge(count: number, emptyLabel = "All"): string {
  return count > 0 ? String(count) : emptyLabel;
}

export function formatSetBadge(isSet: boolean, emptyLabel = "Not set"): string {
  return isSet ? "Set" : emptyLabel;
}
