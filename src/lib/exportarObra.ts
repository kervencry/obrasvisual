import * as XLSX from "xlsx";
import { format } from "date-fns";

export function exportarObraXLSX(obra: any, fin: any[], diario: any[], etapas: any[]) {
  const wb = XLSX.utils.book_new();

  const finRows = fin.map(f => ({
    Data: f.data,
    Tipo: f.tipo,
    Categoria: f.categoria ?? "",
    Etapa: f.etapa ?? "",
    Descrição: f.descricao,
    Valor: Number(f.valor),
  }));
  const wsFin = XLSX.utils.json_to_sheet(finRows);
  XLSX.utils.book_append_sheet(wb, wsFin, "Financeiro");

  const diarioRows = diario.map(d => ({
    Data: d.data,
    Título: d.titulo ?? "",
    Conteúdo: d.conteudo,
    Clima: d.clima ?? "",
    Trabalhadores: d.trabalhadores ?? "",
  }));
  const wsDia = XLSX.utils.json_to_sheet(diarioRows);
  XLSX.utils.book_append_sheet(wb, wsDia, "Diário");

  const etapasRows = etapas.map(e => ({
    Ordem: e.ordem,
    Etapa: e.etapa,
    "Percentual (%)": e.percentual,
    Status: e.status,
    "Início": e.data_inicio ?? "",
    "Fim previsto": e.data_fim_prevista ?? "",
    "Fim real": e.data_fim_real ?? "",
    Observações: e.observacoes ?? "",
  }));
  const wsEt = XLSX.utils.json_to_sheet(etapasRows);
  XLSX.utils.book_append_sheet(wb, wsEt, "Etapas");

  const nome = (obra.nome ?? "obra").replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
  XLSX.writeFile(wb, `${nome}-export-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
}