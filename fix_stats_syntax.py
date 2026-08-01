import re
with open('src/pages/StatisticsPanel.tsx', 'r') as f:
    text = f.read()

# I replaced top_games_end which had:
#                 </table>
#               </div>
#             </div>
#
# with:
#                 </table>
#               </div>
#             </div>
#             </div>
#             {/* 8th Block...
# That extra </div> caused an issue because it closes the <div className="space-y-6"> early, and then we have an expression inside the conditional operator which expects a single element or a fragment.

# Let's fix this by wrapping the whole truthy branch of loading ? (...) in a <> ... </> fragment, or just removing the extra </div>.
# Wait, let's just restore it properly.
text = text.replace('            </div>\n            </div>\n            {/* 8th Block: City Stats Table */}', '            </div>\n            {/* 8th Block: City Stats Table */}')

# Let's check if there's still an issue.
with open('src/pages/StatisticsPanel.tsx', 'w') as f:
    f.write(text)
