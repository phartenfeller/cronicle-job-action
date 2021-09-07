const replacement = '$1 ██████████';

function blankLog(log) {
  let blanked = log.replace(/^(# Job ID:)(.*)$/gm, replacement);
  blanked = blanked.replace(/^(# Event Title:)(.*)$/gm, replacement);
  blanked = blanked.replace(/^(# Hostname:)(.*)$/gm, replacement);

  return blanked;
}

module.exports = blankLog;
