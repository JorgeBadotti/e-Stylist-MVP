// services/copyTemplates.ts
export function applyTemplates(output: any) {
  // Se já existe texto, respeita.
  for (const look of output.looks || []) {
    if (!look.why_it_works || String(look.why_it_works).trim().length < 5) {
      look.why_it_works = 'Combinação coerente para a ocasião, equilibrando conforto, formalidade e praticidade.';
    }
    // Garante que sales_support tenha why_it_works se for um item de loja e esteja vazio
    for (const item of look.items || []) {
      if (item.source === 'store' && item.sales_support && (!item.sales_support.why_it_works || String(item.sales_support.why_it_works).trim().length < 5)) {
        item.sales_support.why_it_works = 'Peça essencial para este look, disponível em nosso catálogo.';
      }
    }
  }

  if (!output.voice_text || String(output.voice_text).trim().length < 5) {
    output.voice_text = 'Preparei três sugestões de looks. Se quiser, posso refinar a explicação ou adaptar para outra ocasião.';
  }

  if (typeof output.next_question !== 'string') output.next_question = '';
  return output;
}