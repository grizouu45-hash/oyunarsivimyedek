import re
with open('src/pages/StatisticsPanel.tsx', 'r') as f:
    text = f.read()

# I want to remove the `{cityStats.length > 0 && (` condition so it always renders, and add an empty state to the table body.
text = text.replace('{/* 8th Block: City Stats Table */}\n            {cityStats.length > 0 && (\n              <div className="bg-[#1A0B2E] backdrop-blur border border-white/10 rounded-2xl shadow-sm overflow-hidden mt-6">', 
                    '{/* 8th Block: City Stats Table */}\n            <div className="bg-[#1A0B2E] backdrop-blur border border-white/10 rounded-2xl shadow-sm overflow-hidden mt-6">')

text = text.replace('                  </table>\n                </div>\n              </div>\n            )}', 
                    """                    {cityStats.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-white/60">
                          Seçilen tarih aralığında şehir verisi bulunamadı.
                        </td>
                      </tr>
                    )}
                  </table>
                </div>
              </div>""")

with open('src/pages/StatisticsPanel.tsx', 'w') as f:
    f.write(text)
