import { supabase } from "../supabase";

export async function uploadReport(
  toolType: string,
  corporationId: string,
  filterApplied: any,
  totalItems: number,
  fileBlob: Blob
): Promise<string | null> {
  try {
    const username = localStorage.getItem("mdm_username") || "Desconhecido";
    const filename = `report_${toolType}_${new Date().getTime()}.xlsx`;

    // 1. Upload to Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("reports")
      .upload(filename, fileBlob, {
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        cacheControl: "3600",
        upsert: false
      });

    if (storageError) {
      console.warn("Erro ao fazer upload do relatório no Storage:", storageError.message);
      return null;
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from("reports")
      .getPublicUrl(filename);

    // 3. Insert report record
    const { error: dbError } = await supabase.from("reports").insert([
      {
        username,
        tool_type: toolType,
        corporation_id: corporationId || "N/A",
        filter_applied: filterApplied,
        total_items: totalItems,
        file_url: publicUrl,
      },
    ]);

    if (dbError) {
      console.warn("Erro ao salvar registro de relatório no Banco:", dbError.message);
    }

    return publicUrl;
  } catch (err) {
    console.warn("Erro ao fazer upload do relatório:", err);
    return null;
  }
}
