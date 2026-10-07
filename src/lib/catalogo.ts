/* Rules of the item pickers of the Bolsa that do not depend on React (T41, §7.8), apart so that they can be checked against the real catalog.
   - What a picker offers: a reward-only item is obtained as a reward, and a metal vial is only a price reference (Q21: the vials of a metal live in
     `PoderPersonaje.viales`, so buying one in the Bolsa would count it twice), so neither is listed. Stormlight has none of them: its lists do not change.
   - Search and subcategory chips (worlds with `features.catalogoDePrecios`): case- and accent-insensitive. */

/** Text for comparisons: without accents, case or extra spaces («Cañón de mano» is found by «canon») */
export const foldText = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

/** Whether the pickers of the Bolsa offer this catalog item. Fields the server does not send (an older API) count as absent */
export const isPickable = (item: { isRewardOnly?: boolean; category?: string | null }): boolean => !item.isRewardOnly && item.category !== 'vial'

/** What a picker lists once the search box and the chip are applied: the label must contain the search and, with a chip, belong to its group */
export function filterPickerItems<T extends { label: string; group?: number }>(items: readonly T[], search: string, group: number | null): T[] {
  const q = foldText(search)
  return items.filter((it) => (group === null || it.group === group) && (q === '' || foldText(it.label).includes(q)))
}
