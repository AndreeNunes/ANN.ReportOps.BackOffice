export function reportTemplate(dto) {
  const yesNo = (v) =>
    v ? '<span class="text-yes">SIM</span>' : '<span class="text-no">NÃO</span>'

  const oilLevelColor = (v) => {
    if (v === 'MAXIMO') return 'text-good'
    if (v === 'REGULAR' || v === 'MEDIO') return 'text-regular'
    if (v === 'BAIXO') return 'text-aggressive'
    return ''
  }

  const envColor = (v) => {
    if (v === 'BOA') return 'text-good'
    if (v === 'REGULAR') return 'text-regular'
    if (v === 'AGRESSIVO' || v === 'AGRESSIVA') return 'text-aggressive'
    return ''
  }

  const oilLevel = dto?.rr_lubricating_oil_level
    ? `<span class="${oilLevelColor(dto.rr_lubricating_oil_level)}">${dto.rr_lubricating_oil_level}</span>`
    : 'N/A'

  const envCondition = dto?.cr_install_env_condition
    ? `<span class="${envColor(dto.cr_install_env_condition)}">${dto.cr_install_env_condition}</span>`
    : 'N/A'

  const cols = '<col />'.repeat(60)

  return `
      <html>
        <head>
          <style>
            @page {
              margin: 16px;
              border: 1px solid #000;
            }

            body {
              margin: 0;
              font-family: Arial, sans-serif;
              font-size: 12px;
              color: #000;
            }

            p {
              margin: 0;
              padding: 0;
              font-size: 12px;
            }

            /* Tabela única: bordas sempre se encontram */
            .grid {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }

            .grid td {
              word-wrap: break-word;
              overflow-wrap: anywhere;
            }

            /* Célula de dados padrão */
            .c {
              border: 1px solid #000;
              padding: 6px 4px;
              font-size: 12px;
              text-align: left;
              vertical-align: middle;
            }

            .center { text-align: center; }
            .bold { font-weight: bold; }

            /* Cabeçalho */
            .hdr-cell {
              height: 90px;
              border-bottom: 2px solid #000;
              vertical-align: middle;
            }

            .hdr-logo {
              border-right: 1px solid #000;
              text-align: center;
            }

            .hdr-title {
              text-align: center;
              font-weight: bold;
            }

            /* Faixas de seção */
            .section-title {
              background-color: rgb(12, 33, 104);
              color: #fff;
              font-size: 12px;
              font-weight: bold;
              text-align: center;
              padding: 6px;
              border: 1px solid #000;
            }

            /* Assinatura */
            .signature {
              text-align: center;
              vertical-align: middle;
              font-size: 12px;
              font-weight: bold;
              padding: 16px;
              page-break-inside: avoid;
              break-inside: avoid;
              margin-top: 72px;
            }

            .line-signature {
              border-top: 1px solid #000;
              width: 34%;
              padding-bottom: 8px;
              margin: 0 auto;
            }

            /* Anexos */
            .attachments-section {
              page-break-before: always;
            }
            .attachments-list {
              display: flex;
              flex-wrap: wrap;
              text-align: left;
            }
            .attachment-item {
              width: 50%;
              box-sizing: border-box;
              border: 1px solid #ddd;
              padding: 6px;
              margin: 0;
              page-break-inside: avoid;
            }
            .attachment-item img {
              width: 100%;
              height: auto;
              max-height: 220px;
              object-fit: contain;
              display: block;
            }
            .attachment-item .attachment-note {
              margin-top: 6px;
              font-size: 12px;
              color: #111827;
              line-height: 1.3;
              word-break: break-word;
            }

            .closing-notes-text { color: rgb(151, 21, 21); }

            /* Cores de status */
            .text-yes, .text-good { color: #16a34a; }
            .text-no, .text-aggressive { color: #dc2626; }
            .text-regular { color: #f59e0b; }
          </style>
        </head>

        <body>
          <table class="grid">
            <colgroup>${cols}</colgroup>

            <tbody>
              <!-- Cabeçalho -->
              <tr>
                <td colspan="9" class="hdr-cell hdr-logo">
                  ${dto?.logo ? `<img src="${dto.logo}" style="max-width: 100px; max-height: 64px; object-fit: contain;" />` : ``}
                </td>
                <td colspan="51" class="hdr-cell hdr-title">
                  <p style="font-size: 18px;">CHECK LIST DE ATENDIMENTO CORRETIVO, PREVENTIVO.</p>
                  <p style="font-size: 18px;">PARTIDA TÉCNICA E AVALIAÇÃO.</p>
                </td>
              </tr>

              <!-- Identificação -->
              <tr>
                <td colspan="6" class="c center" style="height: 50px;">1</td>
                <td colspan="42" class="c bold">Empresa: ${dto?.company?.name ?? 'N/A'}</td>
                <td colspan="12" class="c center">O.S.: ${dto?.OS_number ?? 'N/A'}</td>
              </tr>

              <!-- Equipamento -->
              <tr>
                <td colspan="30" class="c">Equipamento: ${dto?.equipament?.name ?? 'N/A'}</td>
                <td colspan="30" class="c">Horímetro atual: ${dto?.equipament?.current_hour_meter ?? 'N/A'}</td>
              </tr>
              <tr>
                <td colspan="30" class="c">Data de fabricação: ${dto?.equipament?.manufacture_date || 'N/A'}</td>
                <td colspan="30" class="c">Número de série: ${dto?.equipament?.serial_number ?? 'N/A'}</td>
              </tr>
              <tr>
                <td colspan="30" class="c">Modelo da unidade compressora: ${dto?.equipament?.compressor_unit_model ?? 'N/A'}</td>
                <td colspan="30" class="c">Marca e Modelo do Inversor/Soft: ${dto?.equipament?.inverter_softstarter_brand_model ?? 'N/A'}</td>
              </tr>
              <tr>
                <td colspan="30" class="c">Modelo de IHM: ${dto?.equipament?.ihm_model ?? 'N/A'}</td>
                <td colspan="30" class="c">Pressão de trabalho: ${dto?.equipament?.working_pressure ?? 'N/A'}</td>
              </tr>
              <tr>
                <td colspan="30" class="c">Modelo do filtro de coalescente: ${dto?.equipament?.coalescing_filter_model ?? 'N/A'}</td>
                <td colspan="30" class="c">Dados de lubrificação do motor: ${dto?.equipament?.motor_lubrication_data ?? 'N/A'}</td>
              </tr>
              <tr>
                <td colspan="20" class="c">Tensão de alimentação: ${dto?.equipament?.supply_voltage ?? 'N/A'}</td>
                <td colspan="20" class="c">Tensão de comando: ${dto?.equipament?.control_voltage ?? 'N/A'}</td>
                <td colspan="20" class="c">Tensão da solenóide de admissão: ${dto?.equipament?.intake_solenoid_voltage ?? 'N/A'}</td>
              </tr>

              <!-- Considerações gerais -->
              <tr><td colspan="60" class="section-title">CONSIDERAÇÕES GERAIS DO ATENDIMENTO</td></tr>
              <tr><td colspan="60" class="c">Motivo da visita: ${dto?.cga_reason_visit != null ? '<br /> ' : ''} ${dto?.cga_reason_visit ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Defeito/Situação encontrada: ${dto?.cga_reported_defect != null ? '<br /> ' : ''} ${dto?.cga_reported_defect ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Serviço realizado: ${dto?.cga_solution_applied != null ? '<br /> ' : ''} ${dto?.cga_solution_applied ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Peças substituídas nesta visita: ${dto?.cga_replaced_parts != null ? '<br /> ' : ''} ${dto?.cga_replaced_parts ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Peças que necessitam de substituição: ${dto?.cga_parts_to_replace != null ? '<br /> ' : ''} ${dto?.cga_parts_to_replace ?? 'N/A'}</td></tr>

              <!-- Planos de manutenção -->
              <tr><td colspan="60" class="section-title">PLANOS DE MANUTENÇÃO</td></tr>
              <tr><td colspan="60" class="c">Óleo: ${dto?.mp_oil ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Elemento separador de Ar/Óleo: ${dto?.mp_air_oil_separator_element ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Filtro de ar primário: ${dto?.mp_primary_air_filter ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Filtro de ar secundário: ${dto?.mp_secondary_air_filter ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Filtro de ar Standard: ${dto?.mp_standard_air_filter ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Filtro de óleo: ${dto?.mp_oil_filter ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Lubrificante do motor: ${dto?.mp_engine_lubricant ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Elemento coalescente: ${dto?.mp_coalescing_element ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Revisão do elemento do compressor: ${dto?.mp_compressor_element_revision ?? 'N/A'}</td></tr>

              <!-- Leituras obrigatórias -->
              <tr><td colspan="60" class="section-title">LEITURAS OBRIGATÓRIAS</td></tr>
              <tr>
                <td colspan="33" class="c">Nível de óleo lubrificante:</td>
                <td colspan="27" class="c center">${oilLevel}</td>
              </tr>
              <tr><td colspan="60" class="c">Quantidade de óleo em estoque: ${dto?.rr_oil_stock_quantity ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Descrição do modelo de óleo: ${dto?.rr_oil_model ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Tipo de óleo: ${dto?.rr_oil_type ?? 'N/A'}</td></tr>
              <tr>
                <td colspan="33" class="c">Tensão da rede elétrica com carga:</td>
                <td colspan="9" class="c center">R: ${dto?.rr_supply_voltage_under_load_R ?? 'N/A'}</td>
                <td colspan="9" class="c center">S: ${dto?.rr_supply_voltage_under_load_S ?? 'N/A'}</td>
                <td colspan="9" class="c center">T: ${dto?.rr_supply_voltage_under_load_T ?? 'N/A'}</td>
              </tr>
              <tr>
                <td colspan="33" class="c">Tensão da rede elétrica em alívio:</td>
                <td colspan="9" class="c center">R: ${dto?.rr_supply_voltage_unloaded_R ?? 'N/A'}</td>
                <td colspan="9" class="c center">S: ${dto?.rr_supply_voltage_unloaded_S ?? 'N/A'}</td>
                <td colspan="9" class="c center">T: ${dto?.rr_supply_voltage_unloaded_T ?? 'N/A'}</td>
              </tr>
              <tr><td colspan="60" class="c">Corrente do motor elétrico com fator de serviço: ${dto?.rr_service_factor_current ?? 'N/A'}</td></tr>
              <tr>
                <td colspan="33" class="c">Corrente elétrica com carga:</td>
                <td colspan="9" class="c center">R: ${dto?.rr_electrical_current_under_load_R ?? 'N/A'}</td>
                <td colspan="9" class="c center">S: ${dto?.rr_electrical_current_under_load_S ?? 'N/A'}</td>
                <td colspan="9" class="c center">T: ${dto?.rr_electrical_current_under_load_T ?? 'N/A'}</td>
              </tr>
              <tr>
                <td colspan="33" class="c">Corrente elétrica em alívio:</td>
                <td colspan="9" class="c center">R: ${dto?.rr_electrical_current_unloaded_R ?? 'N/A'}</td>
                <td colspan="9" class="c center">S: ${dto?.rr_electrical_current_unloaded_S ?? 'N/A'}</td>
                <td colspan="9" class="c center">T: ${dto?.rr_electrical_current_unloaded_T ?? 'N/A'}</td>
              </tr>
              <tr><td colspan="60" class="c">Corrente elétrica do motor do ventilador: ${dto?.rr_fan_motor_current ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Temperatura de trabalho do compressor: ${dto?.rr_compressor_operating_temperature ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Corrente elétrica do secador: ${dto?.rr_dryer_current ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Temperatura do ponto de orvalho: ${dto?.rr_dew_point_temperature ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Temperatura do ambiente: ${dto?.rr_ambient_temperature ?? 'N/A'}</td></tr>

              <!-- Sala de geração do ar comprimido -->
              <tr><td colspan="60" class="section-title">SALA DE GERAÇÃO DO AR COMPRIMIDO</td></tr>
              <tr>
                <td colspan="48" class="c">Equipamento possui duto para retirada de ar quente regularizado?</td>
                <td colspan="12" class="c center">${yesNo(dto?.cr_hot_air_duct_ok)}</td>
              </tr>
              ${dto?.cr_hot_air_duct_ok === true ? `
              <tr>
                <td colspan="48" class="c">Duto regularizado?</td>
                <td colspan="12" class="c center">${yesNo(dto?.cr_hot_air_duct_regularized)}</td>
              </tr>` : ``}
              <tr>
                <td colspan="48" class="c">Temperatura e ventilação da sala são adequadas? (A temperatura deve ser até 35°C)</td>
                <td colspan="12" class="c center">${yesNo(dto?.cr_room_temp_vent_ok)}</td>
              </tr>
              ${dto?.cr_room_temp_vent_ok === false ? `
              <tr><td colspan="60" class="c">Observações: ${dto?.cr_room_notes ?? 'N/A'}</td></tr>` : ``}
              <tr>
                <td colspan="48" class="c">Condições do ambiente de instalação do compressor?</td>
                <td colspan="12" class="c center">${envCondition}</td>
              </tr>
              <tr>
                <td colspan="48" class="c">Existe risco de acidente?</td>
                <td colspan="12" class="c center">${yesNo(dto?.cr_accident_risk)}</td>
              </tr>
              <tr>
                <td colspan="48" class="c">Instalação elétrica está adequada?</td>
                <td colspan="12" class="c center">${yesNo(dto?.cr_electrical_install_ok)}</td>
              </tr>
              <tr>
                <td colspan="48" class="c">Instalação possui aterramento para sua segurança?</td>
                <td colspan="12" class="c center">${yesNo(dto?.cr_grounding_ok)}</td>
              </tr>
              <tr>
                <td colspan="48" class="c">Iluminação da sala é adequada?</td>
                <td colspan="12" class="c center">${yesNo(dto?.cr_room_lighting_ok)}</td>
              </tr>
              <tr>
                <td colspan="48" class="c">Existe tomada de serviço 220V?</td>
                <td colspan="12" class="c center">${yesNo(dto?.cr_service_outlet_220v)}</td>
              </tr>
              <tr>
                <td colspan="48" class="c">Sala possui ponto de ar com mangueira para limpeza do compressor?</td>
                <td colspan="12" class="c center">${yesNo(dto?.cr_air_point_for_cleaning)}</td>
              </tr>
              <tr>
                <td colspan="48" class="c">Sala possui ponto de água com torneira para hidrolavadora?</td>
                <td colspan="12" class="c center">${yesNo(dto?.cr_water_point_available)}</td>
              </tr>
              <tr>
                <td colspan="48" class="c">Compressor atente os distanciamento exigidos para um bom funcionamento? (O distanciamento ideal: 1,5mt de cada lado)</td>
                <td colspan="12" class="c center">${yesNo(dto?.cr_distancing_ok)}</td>
              </tr>
              <tr>
                <td colspan="48" class="c">Acesso ao compressor é correto e seguro?</td>
                <td colspan="12" class="c center">${yesNo(dto?.cr_compressor_ok)}</td>
              </tr>
              <tr><td colspan="60" class="c">Sugestões de melhorias: ${dto?.cr_improvement_suggestions ?? 'N/A'}</td></tr>

              <!-- Informações de encerramento -->
              <tr><td colspan="60" class="section-title">INFORMAÇÕES DE ENCERRAMENTO</td></tr>
              <tr>
                <td colspan="30" class="c">Data de início: ${dto?.closing_start_time_1 ?? 'N/A'}</td>
                <td colspan="30" class="c">Hora de início: ${dto?.closing_start_time_2 ?? 'N/A'}</td>
              </tr>
              <tr>
                <td colspan="30" class="c">Data de fim: ${dto?.closing_end_time_1 ?? 'N/A'}</td>
                <td colspan="30" class="c">Hora de fim: ${dto?.closing_end_time_2 ?? 'N/A'}</td>
              </tr>
              <tr><td colspan="60" class="c">Nome do técnico: ${dto?.closing_technician_responsible ?? 'N/A'}</td></tr>
              <tr><td colspan="60" class="c">Nome do responsável: ${dto?.closing_responsible ?? 'N/A'}</td></tr>
              ${dto?.closing_notes ? `
              <tr><td colspan="60" class="c closing-notes-text">Observações: ${dto?.closing_notes}</td></tr>` : ``}
            </tbody>
          </table>

          <div class="signature">
            ${dto?.signature ? `<img src="${dto?.signature}" width="130px" height="90px" style="margin-bottom: 8px;" />` : ``}
            <div class="line-signature"></div>
            Assinatura do responsável:
          </div>

          ${dto?.attachments?.length > 0 ? `
            <div class="attachments-section">
              <table class="grid">
                <colgroup>${cols}</colgroup>
                <tbody>
                  <tr><td colspan="60" class="section-title">Anexos</td></tr>
                </tbody>
              </table>
              <div class="attachments-list">
                ${dto?.attachments?.map(attachment => `
                  <div class="attachment-item">
                    <img src="${attachment}" />
                    ${dto?.attachments_notes && dto?.attachments_notes[attachment]
                      ? `<p class="attachment-note">${dto?.attachments_notes[attachment]}</p>`
                      : ``}
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="signature">
              ${dto?.signature ? `<img src="${dto?.signature}" width="130px" height="90px" style="margin-bottom: 8px;" />` : ``}
              <div class="line-signature"></div>
              Assinatura do responsável:
            </div>
          ` : ``}
        </body>
      </html>
    `
}
