/** Normalize ARASAAC labels so accent marks do not prevent exact keyword matches. */
/** @param {string} value */
export function normalizePictogramKeyword(value) {
	return String(value)
		.normalize('NFKC')
		.toLocaleLowerCase('en')
		.trim()
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '');
}
