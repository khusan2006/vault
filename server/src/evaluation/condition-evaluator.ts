import { Injectable } from '@nestjs/common';
import type { Condition, ConditionGroup } from '../common/types/index.js';
import { isConditionGroup } from '../common/types/index.js';
import type { CustomerData } from './customer-data.service.js';

@Injectable()
export class ConditionEvaluator {
  evaluate(customerData: CustomerData, conditionGroup: ConditionGroup): boolean {
    if (!conditionGroup.conditions || conditionGroup.conditions.length === 0) {
      return true;
    }

    const results = conditionGroup.conditions.map((item) => {
      if (isConditionGroup(item)) {
        return this.evaluate(customerData, item);
      }
      return this.evaluateCondition(customerData, item);
    });

    if (conditionGroup.operator === 'AND') {
      return results.every(Boolean);
    }
    return results.some(Boolean);
  }

  private evaluateCondition(
    customerData: CustomerData,
    condition: Condition,
  ): boolean {
    switch (condition.type) {
      case 'customer_tag':
        return this.evaluateTag(customerData.tags, condition);
      case 'account_age_days':
        return this.evaluateNumeric(
          this.getAccountAgeDays(customerData.createdAt),
          condition,
        );
      case 'total_spent':
        return this.evaluateNumeric(customerData.totalSpent, condition);
      case 'order_count':
        return this.evaluateNumeric(customerData.orderCount, condition);
      default:
        return false;
    }
  }

  private evaluateTag(tags: string[], condition: Condition): boolean {
    const value = String(condition.value).toLowerCase();
    const lowerTags = tags.map((t) => t.toLowerCase());

    switch (condition.operator) {
      case 'equals':
        return lowerTags.includes(value);
      case 'not_equals':
        return !lowerTags.includes(value);
      case 'contains':
        return lowerTags.some((tag) => tag.includes(value));
      case 'not_contains':
        return !lowerTags.some((tag) => tag.includes(value));
      default:
        return false;
    }
  }

  private evaluateNumeric(actual: number, condition: Condition): boolean {
    const expected = Number(condition.value);
    if (isNaN(expected)) return false;

    switch (condition.operator) {
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'greater_than':
        return actual > expected;
      case 'less_than':
        return actual < expected;
      case 'greater_than_or_equal':
        return actual >= expected;
      case 'less_than_or_equal':
        return actual <= expected;
      default:
        return false;
    }
  }

  private getAccountAgeDays(createdAt: Date): number {
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}
