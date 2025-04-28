import { IMatchCriteria, MatchType, MatchField } from "./matchCriteria.type";

export class MatchCriteria {
  public matchCriteria: MatchField[];
  constructor(matchCriteria: MatchField[]) {
    this.matchCriteria = matchCriteria;
  }

  editField(oldField: string, newField: string) {
    this.matchCriteria = this.matchCriteria.map((c) => {
      if (c.founderField === oldField) {
        return { ...c, investorField: newField };
      }
      if (c.investorField === oldField) {
        return { ...c, founderField: newField };
      }
      return c;
    });

    return this;
  }

  hasField(field: string) {
    return this.matchCriteria.some(
      (c) => c.founderField === field || c.investorField === field
    );
  }

  removeField(field: string) {
    this.matchCriteria = this.matchCriteria.filter(
      (c) => c.founderField !== field && c.investorField !== field
    );

    return this;
  }

  addField(
    field: string,
    matchType: MatchType = MatchType.EXACT,
    weight: number = 1,
    required: boolean = false
  ) {
    if (!this.hasField(field)) {
      this.matchCriteria.push({
        founderField: field,
        investorField: field,
        matchType,
        weight,
        required,
      });
    }

    return this;
  }

  editMatchCriteria(
    founderField: string,
    investorField: string,
    update: {
      matchType?: MatchType;
      weight?: number;
      required?: boolean;
    }
  ) {
    this.matchCriteria = this.matchCriteria.map((c) => {
      if (
        c.founderField === founderField &&
        c.investorField === investorField
      ) {
        return {
          ...c,
          ...update,
        };
      }
      return c;
    });

    return this;
  }

  addMatchCriteria(
    founderField: string,
    investorField: string,
    matchType: MatchType = MatchType.EXACT,
    weight: number = 1,
    required: boolean = false
  ) {
    if (!this.hasField(investorField) && !this.hasField(founderField)) {
      this.matchCriteria.push({
        founderField: founderField,
        investorField: investorField,
        matchType,
        weight,
        required,
      });
    }

    return this;
  }

  getMatchCriteria(founderField: string, investorField: string) {
    return this.matchCriteria.find(
      (c) =>
        c.founderField === founderField && c.investorField === investorField
    );
  }

  isSame(matchCriteria: MatchField[]) {
    return JSON.stringify(this.matchCriteria) === JSON.stringify(matchCriteria);
  }
}
