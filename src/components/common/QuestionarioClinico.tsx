import React, { useState } from 'react'
import {
  QuestionarioTemplate,
  RespostaQuestionario,
  QuestaoClinica,
  UserPerfil,
} from '@/types/saude'
import { QuestionariosService, isCampoVisivel } from '@/services/saude'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ClipboardCheck,
  CheckCircle2,
  Lock,
  Calendar,
  UserCheck,
  FileQuestion,
  HelpCircle,
  Clock,
  Sparkles,
  AlertCircle,
  Eye,
} from 'lucide-react'

interface QuestionarioClinicoProps {
  fichaId?: string
  condicaoPrincipal?: string
  template: QuestionarioTemplate | null
  allTemplates?: QuestionarioTemplate[]
  onSelectTemplate?: (tpl: QuestionarioTemplate) => void
  respostasSalvas: RespostaQuestionario[]
  onRespostasSalvasUpdated?: () => void
  usuarioAtualId?: string
  perfilUsuario?: UserPerfil
  readOnly?: boolean
}

export function QuestionarioClinico({
  fichaId,
  condicaoPrincipal,
  template,
  allTemplates = [],
  onSelectTemplate,
  respostasSalvas,
  onRespostasSalvasUpdated,
  usuarioAtualId,
  perfilUsuario = 'OPERACAO',
  readOnly = false,
}: QuestionarioClinicoProps) {
  // Estado das respostas digitadas no formulário ativo
  const [respostas, setRespostas] = useState<Record<string, any>>({})
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [visualizandoHistoricoId, setVisualizandoHistoricoId] = useState<string | null>(null)

  // Verificação LGPD: se perfil for GESTOR_RH e condicao_principal não estiver visível (ou perfil sem acesso clínico)
  // Perfis com atuação clínica e preenchimento de questionário: GESTOR_VENART, GESTOR_PROGRAMA, OPERACAO
  const temPermissaoClinica =
    perfilUsuario !== 'GESTOR_RH' && isCampoVisivel(perfilUsuario, 'condicao_principal')

  if (!temPermissaoClinica) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900">
              Dados Clínicos Restritos (Proteção LGPD)
            </h3>
            <p className="text-xs text-amber-700 max-w-md mt-1">
              O seu perfil de acesso (<strong>{perfilUsuario}</strong>) não possui autorização para
              visualizar dados de questionários e anamneses clínicas em conformidade com as
              diretrizes da matriz de privacidade (config_lgpd_campos).
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleRespostaChange = (questaoId: string, valor: any) => {
    setRespostas((prev) => ({
      ...prev,
      [questaoId]: valor,
    }))
  }

  const handleSalvarQuestionario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fichaId || !template || !usuarioAtualId) {
      setErro('É necessário salvar a ficha antes de preencher o questionário clínico.')
      return
    }

    // Validar questões obrigatórias
    for (const q of template.questoes) {
      if (q.obrigatoria) {
        const val = respostas[q.id]
        if (val === undefined || val === null || val === '') {
          setErro(`Por favor, responda à questão obrigatória: "${q.enunciado}"`)
          return
        }
      }
    }

    setSalvando(true)
    setErro(null)
    setSucesso(null)

    try {
      await QuestionariosService.salvarRespostas({
        ficha_id: fichaId,
        template_id: template.id,
        respostas,
        preenchido_por: usuarioAtualId,
        data_preenchimento: new Date().toISOString(),
      })

      setSucesso('Questionário clínico preenchido e gravado com sucesso!')
      setRespostas({})
      if (onRespostasSalvasUpdated) {
        onRespostasSalvasUpdated()
      }
    } catch (err: any) {
      setErro(err?.message || 'Erro ao gravar respostas do questionário.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Protocolo Clínico */}
      <Card className="border-teal-200 bg-linear-to-r from-teal-50/70 via-white to-slate-50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base text-slate-900 font-bold flex items-center gap-2">
                  {template?.titulo || 'Questionário Clínico'}
                  {template && (
                    <Badge
                      variant="outline"
                      className="border-teal-500 text-teal-700 bg-teal-50 text-[11px]"
                    >
                      {template.condicao_principal}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 mt-0.5">
                  {template?.descricao ||
                    'Protocolo de acompanhamento padronizado conforme a condição clínica identificada.'}
                </CardDescription>
              </div>
            </div>

            {/* Seletor de template alternativo se desejar alterar o protocolo */}
            {allTemplates.length > 0 && onSelectTemplate && !readOnly && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">Alterar Protocolo:</span>
                <select
                  value={template?.id || ''}
                  onChange={(e) => {
                    const sel = allTemplates.find((t) => t.id === e.target.value)
                    if (sel) onSelectTemplate(sel)
                  }}
                  className="h-8 text-xs rounded border border-slate-300 bg-white px-2 py-1"
                >
                  {allTemplates.map((t) => (
                    <SelectItemOption key={t.id} value={t.id} label={t.condicao_principal} />
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Histórico de Questionários Já Respondidos Nesta Ficha */}
      {respostasSalvas && respostasSalvas.length > 0 && (
        <Card className="border-slate-200 bg-slate-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-700" />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Avaliações Já Preenchidas ({respostasSalvas.length})
                </CardTitle>
              </div>
              <span className="text-[11px] text-slate-500">Somente leitura</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {respostasSalvas.map((resp, idx) => {
                const isSelected =
                  visualizandoHistoricoId === resp.id || (!visualizandoHistoricoId && idx === 0)
                const dataFormatada = resp.data_preenchimento
                  ? new Date(resp.data_preenchimento).toLocaleString('pt-BR')
                  : resp.created
                    ? new Date(resp.created).toLocaleString('pt-BR')
                    : 'Data não informada'

                return (
                  <button
                    key={resp.id}
                    type="button"
                    onClick={() => setVisualizandoHistoricoId(resp.id)}
                    className={`text-left p-3 rounded-lg border transition-all text-xs flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'border-teal-500 bg-white ring-2 ring-teal-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-slate-800">
                        {resp.expand?.template_id?.titulo || 'Questionário Preenchido'}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        Registro #{idx + 1}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {dataFormatada}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        {resp.expand?.preenchido_por?.name || 'Profissional'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Visualização detalhada das respostas salvas selecionadas */}
            {(() => {
              const selectedResp =
                respostasSalvas.find((r) => r.id === visualizandoHistoricoId) || respostasSalvas[0]
              if (!selectedResp) return null

              const tplUtilizado = selectedResp.expand?.template_id || template

              return (
                <div className="p-4 bg-white rounded-lg border border-teal-100 space-y-4 mt-2 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Respostas Registradas —{' '}
                        {selectedResp.expand?.template_id?.titulo || template?.titulo}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Preenchido por {selectedResp.expand?.preenchido_por?.name || 'Profissional'}{' '}
                        em{' '}
                        {new Date(
                          selectedResp.data_preenchimento || selectedResp.created || '',
                        ).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                      Concluído
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {tplUtilizado?.questoes && tplUtilizado.questoes.length > 0
                      ? tplUtilizado.questoes.map((q, qIdx) => {
                          const respostaVal = selectedResp.respostas?.[q.id]
                          return (
                            <div
                              key={q.id}
                              className="p-2.5 rounded bg-slate-50/70 border border-slate-200 text-xs space-y-1"
                            >
                              <div className="font-semibold text-slate-800">
                                {qIdx + 1}. {q.enunciado}
                              </div>
                              <div className="text-teal-900 font-medium pl-2 border-l-2 border-teal-500 bg-teal-50/50 py-1">
                                {respostaVal !== undefined &&
                                respostaVal !== null &&
                                respostaVal !== '' ? (
                                  String(respostaVal)
                                ) : (
                                  <span className="italic text-slate-400">Não respondido</span>
                                )}
                              </div>
                            </div>
                          )
                        })
                      : // Se não tiver a lista de questões no template expandido, lista as chaves do json
                        Object.entries(selectedResp.respostas || {}).map(([key, val], idx) => (
                          <div key={key} className="p-2 rounded bg-slate-50 border text-xs">
                            <span className="font-semibold text-slate-700">{key}:</span>{' '}
                            <span className="text-teal-800 font-medium">{String(val)}</span>
                          </div>
                        ))}
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Formulário para Novo Preenchimento (se não for somente leitura) */}
      {!readOnly && (
        <Card className="border-teal-200">
          <CardHeader className="pb-3 border-b bg-teal-50/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FileQuestion className="w-4 h-4 text-teal-600" />
                  Preencher Avaliação Clínica do Atendimento Atual
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Responda às questões específicas de{' '}
                  <strong>
                    {template?.condicao_principal || condicaoPrincipal || 'acompanhamento'}
                  </strong>
                </CardDescription>
              </div>

              {!fichaId && (
                <Badge
                  variant="outline"
                  className="border-amber-400 bg-amber-50 text-amber-800 text-[10px]"
                >
                  Ficha precisa ser gravada
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {sucesso && (
              <Alert className="bg-emerald-50 border-emerald-300 text-emerald-800 mb-4 py-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-xs font-semibold">{sucesso}</AlertDescription>
              </Alert>
            )}

            {erro && (
              <Alert variant="destructive" className="mb-4 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{erro}</AlertDescription>
              </Alert>
            )}

            {!fichaId ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Salve a ficha de atendimento pela primeira vez para habilitar a gravação das
                  respostas do questionário clínico.
                </span>
              </div>
            ) : !template || !template.questoes || template.questoes.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Nenhuma questão configurada para este template.
              </div>
            ) : (
              <form onSubmit={handleSalvarQuestionario} className="space-y-5">
                {template.questoes.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Label className="text-xs font-semibold text-slate-900 leading-snug">
                        {idx + 1}. {q.enunciado}{' '}
                        {q.obrigatoria && <span className="text-red-500 font-bold">*</span>}
                      </Label>
                      <Badge variant="secondary" className="text-[10px] shrink-0 font-normal">
                        {q.tipo === 'sim_nao'
                          ? 'Sim/Não'
                          : q.tipo === 'escala'
                            ? 'Escala 0–5'
                            : q.tipo === 'multipla_escolha'
                              ? 'Múltipla Escolha'
                              : 'Texto Livre'}
                      </Badge>
                    </div>

                    {/* Renderização pelo tipo de questão */}
                    {q.tipo === 'sim_nao' && (
                      <RadioGroup
                        value={respostas[q.id] !== undefined ? String(respostas[q.id]) : ''}
                        onValueChange={(val) =>
                          handleRespostaChange(q.id, val === 'Sim' ? 'Sim' : 'Não')
                        }
                        className="flex items-center gap-6 pt-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Sim" id={`${q.id}-sim`} />
                          <Label
                            htmlFor={`${q.id}-sim`}
                            className="text-xs font-medium cursor-pointer"
                          >
                            Sim
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Não" id={`${q.id}-nao`} />
                          <Label
                            htmlFor={`${q.id}-nao`}
                            className="text-xs font-medium cursor-pointer"
                          >
                            Não
                          </Label>
                        </div>
                      </RadioGroup>
                    )}

                    {q.tipo === 'escala' && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-2">
                          {[0, 1, 2, 3, 4, 5].map((num) => {
                            const isSelected =
                              respostas[q.id] === num || respostas[q.id] === String(num)
                            return (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handleRespostaChange(q.id, num)}
                                className={`w-8 h-8 rounded-md text-xs font-bold border transition-colors ${
                                  isSelected
                                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                {num}
                              </button>
                            )
                          })}
                        </div>
                        {(q.legendaMin || q.legendaMax) && (
                          <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                            <span>{q.legendaMin || '0'}</span>
                            <span>{q.legendaMax || '5'}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {q.tipo === 'multipla_escolha' && (
                      <RadioGroup
                        value={respostas[q.id] || ''}
                        onValueChange={(val) => handleRespostaChange(q.id, val)}
                        className="space-y-1.5 pt-1"
                      >
                        {(q.opcoes || []).map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt} id={`${q.id}-opt-${optIdx}`} />
                            <Label
                              htmlFor={`${q.id}-opt-${optIdx}`}
                              className="text-xs text-slate-700 font-normal cursor-pointer"
                            >
                              {opt}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {q.tipo === 'texto_livre' && (
                      <Textarea
                        rows={2}
                        value={respostas[q.id] || ''}
                        onChange={(e) => handleRespostaChange(q.id, e.target.value)}
                        placeholder={q.placeholder || 'Digite a resposta ou relato...'}
                        className="text-xs mt-1"
                      />
                    )}
                  </div>
                ))}

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={salvando}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {salvando ? 'Gravando Questionário...' : 'Gravar Respostas do Questionário'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SelectItemOption({ value, label }: { value: string; label: string }) {
  return <option value={value}>{label}</option>
}
