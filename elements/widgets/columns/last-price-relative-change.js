/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatRelativeChange } from '../../../lib/intl.js';
import { Column, columnStyles } from './column.js';
import { TRADER_DATUM, TRADING_STATUS } from '../../../lib/const.js';

export const columnTemplate = html`
  <template>
    ${when(
      (x) => x.isBalance,
      html`<span></span>`,
      html`
        <div class="control-line dot-line">
          <span
            ?hidden="${(x) =>
              x.datum === TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE ||
              typeof x.lastPriceRelativeChange !== 'number' ||
              isNaN(x.lastPriceRelativeChange) ||
              ![TRADING_STATUS.PREMARKET, TRADING_STATUS.AFTER_HOURS].includes(
                x.status
              )}"
            class="dot ${(x) =>
              x.status === TRADING_STATUS.PREMARKET ? 'dot-1' : 'dot-4'}"
          ></span>
          <span
            class="${(x) =>
              x.lastPriceRelativeChange > 0
                ? 'positive'
                : x.lastPriceRelativeChange < 0
                ? 'negative'
                : ''}"
          >
            ${(cell) =>
              formatRelativeChange(cell.lastPriceRelativeChange / 100)}
          </span>
        </div>
      `
    )}
  </template>
`;

export class LastPriceRelativeChangeColumn extends Column {
  @observable
  lastPriceRelativeChange;

  get value() {
    return this.lastPriceRelativeChange;
  }

  @observable
  status;

  datum;

  constructor(datum = TRADER_DATUM.LAST_PRICE_RELATIVE_CHANGE) {
    super();

    this.datum = datum;
  }

  async connectedCallback() {
    await super.connectedCallback();

    if (!this.isBalance) {
      await this.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPriceRelativeChange: this.datum,
          status: TRADER_DATUM.STATUS
        }
      });
    }
  }

  async disconnectedCallback() {
    if (!this.isBalance) {
      await this.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPriceRelativeChange: this.datum,
          status: TRADER_DATUM.STATUS
        }
      });
    }

    return super.disconnectedCallback();
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default LastPriceRelativeChangeColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
