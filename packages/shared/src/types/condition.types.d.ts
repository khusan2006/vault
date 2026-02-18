export type ConditionOperator = 'AND' | 'OR';
export type ConditionType = 'customer_tag' | 'account_age_days' | 'total_spent' | 'order_count';
export type ComparisonOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'greater_than_or_equal' | 'less_than_or_equal';
export interface Condition {
    type: ConditionType;
    operator: ComparisonOperator;
    value: string | number;
}
export interface ConditionGroup {
    operator: ConditionOperator;
    conditions: (Condition | ConditionGroup)[];
}
export declare function isConditionGroup(item: Condition | ConditionGroup): item is ConditionGroup;
