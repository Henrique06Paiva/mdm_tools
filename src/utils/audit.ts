import { supabase } from "../supabase";

export async function logAudit(
  actionType: string,
  corporationId: string,
  payload: any,
  status: "SUCCESS" | "FAILED" = "SUCCESS"
) {
  try {
    const username = localStorage.getItem("mdm_username") || "Desconhecido";
    
    // Obter dados básicos de IP e resolução do dispositivo se disponível
    const screenResolution = `${window.innerWidth}x${window.innerHeight}`;
    const userAgent = navigator.userAgent;

    const { error } = await supabase.from("audit_logs").insert([
      {
        username,
        action_type: actionType,
        corporation_id: corporationId,
        payload,
        status,
        device_info: {
          resolution: screenResolution,
          userAgent: userAgent
        }
      },
    ]);

    if (error) {
      console.warn("Erro ao salvar log de auditoria no Supabase:", error.message);
    }
  } catch (err) {
    console.warn("Erro ao executar logAudit:", err);
  }
}
