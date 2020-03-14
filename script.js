var main

document.addEventListener('DOMContentLoaded', function () {
  main = document.getElementById('main')
  addVersion()
  removeNoscripts()
  selectCommonParts()
  addUI()
  renderLicense()
})

var VERSION = 'Prerelease'

function addVersion () {
  var header = document.getElementById('header')
  var p = document.createElement('p')
  p.id = 'version'
  p.appendChild(document.createTextNode('Version: ' + VERSION))
  header.appendChild(p)
}

function removeNoscripts () {
  var elements = document.getElementsByTagName('noscript')
  for (var index = 0; index < elements.length; index++) {
    var element = elements[index]
    element.parentNode.removeChild(element)
  }
}

function selectCommonParts () {
  parts.forEach(function (part) {
    if (part.required) return
    if (part.common) selections[part.heading] = true
  })
}

function addUI () {
  addForm()
  updateForm()
  addLicense()
}

function addForm () {
  var h2 = document.createElement('h2')
  h2.appendChild(document.createTextNode('Options'))
  main.appendChild(h2)

  var form = document.createElement('form')
  form.id = 'form'
  form.addEventListener('input', onInput)
  parts.forEach(function (part) {
    var labelP = document.createElement('p')
    var label = document.createElement('label')
    var input = document.createElement('input')
    input.type = 'checkbox'
    input.id = part.heading
    if (part.required) {
      input.checked = true
      input.disabled = true
    }
    if (selections[part.heading]) {
      input.checked = true
    }
    labelP.appendChild(label)
    label.appendChild(input)
    label.appendChild(document.createTextNode(part.heading))
    if (part.required) {
      label.appendChild(document.createTextNode(' (required)'))
    }
    if (part.common) {
      label.appendChild(document.createTextNode(' (common)'))
    }
    if (part.needs.length > 0) {
      var list = part.needs.join(', ')
      label.appendChild(document.createTextNode(' (needs ' + list + ')'))
    }
    form.appendChild(labelP)
    if (part.note) {
      var noteP = document.createElement('p')
      noteP.appendChild(document.createTextNode(part.note))
      form.appendChild(noteP)
    }
    if (part.hint) {
      var hintP = document.createElement('p')
      hintP.appendChild(document.createTextNode('Hint: ' + part.hint))
      form.appendChild(hintP)
    }
  })
  main.appendChild(form)
}

function onInput () {
  readSelections()
  updateForm()
  renderLicense()
}

function readSelections () {
  parts.forEach(function (part) {
    var input = document.getElementById(part.heading)
    selections[part.heading] = input.checked
  })
}

function validSelections (selections) {
  var selected = parts.filter(function (part) {
    return selections[part.heading] || part.required
  })
  return selected.every(function (part) {
    return (
      part.needs.every(function (heading) {
        return selections[heading]
      }) &&
      part.conflicts.every(function (heading) {
        return !selections[heading]
      }) &&
      !selected.some(function (otherPart) {
        return otherPart.conflicts.indexOf(part.heading) !== -1
      })
    )
  })
}

function updateForm () {
  parts.forEach(function (part) {
    if (part.required) return
    if (selections[part.heading]) {
      var deselectThisPart = {}
      deselectThisPart[part.heading] = false
      var withoutThisPart = Object.assign({}, selections, deselectThisPart)
      if (!validSelections(withoutThisPart)) disableInput()
      else enableInput()
    } else {
      var selectThisPart = {}
      selectThisPart[part.heading] = true
      var withThisPart = Object.assign({}, selections, selectThisPart)
      if (!validSelections(withThisPart)) disableInput()
      else enableInput()
    }

    function disableInput () {
      document.getElementById(part.heading).disabled = true
    }

    function enableInput () {
      document.getElementById(part.heading).disabled = false
    }
  })
}

var blockquote, commonmark

function addLicense () {
  addH2()
  addCopyButton()
  addHTML()
  addCommonMark()

  function addH2 () {
    var h2 = document.createElement('h2')
    h2.appendChild(document.createTextNode('License Text'))
    main.appendChild(h2)
  }

  function addCopyButton () {
    if (navigator.clipboard) {
      var button = document.createElement('button')
      button.appendChild(document.createTextNode('Copy CommonMark to Clipboard'))
      button.addEventListener('click', function () {
        navigator.clipboard.writeText(commonmark.innerText + '\n')
          .then(function () {
            window.alert('Copied!')
          })
      })
      main.appendChild(button)
    }
  }

  function addHTML () {
    var h3 = document.createElement('h3')
    h3.appendChild(document.createTextNode('HTML'))
    main.appendChild(h3)
    blockquote = document.createElement('blockquote')
    blockquote.setAttribute('id', 'html')
    main.appendChild(blockquote)
  }

  function addCommonMark () {
    var h3 = document.createElement('h3')
    h3.appendChild(document.createTextNode('CommonMark'))
    main.appendChild(h3)

    commonmark = document.createElement('pre')
    commonmark.id = 'commonmark'
    main.appendChild(commonmark)
  }
}

var selections = {}

var SENTENCE_SEPARATOR = '  '

var parts = [
  {
    heading: 'Acceptance',
    text: [
      'In order to receive this license, you must agree to its rules.',
      'The rules of this license are both obligations under that agreement and conditions to your license.',
      'You must not do anything with this software that triggers a rule that you cannot or will not follow.'
    ].join(SENTENCE_SEPARATOR),
    required: true
  },
  {
    heading: 'Copyright',
    text: 'Each contributor licenses you to do everything with this software that would otherwise infringe that contributor\'s copyright in it.',
    required: true
  },
  {
    heading: 'Patent',
    text: 'Each contributor licenses you to do everything with this software that would otherwise infringe any patent claims they can license or become able to license.',
    note: 'Explicitly license patents on the software.'
  },
  {
    heading: 'Reliability',
    text: 'No contributor can revoke this license.',
    note: 'Explicity make licenses irrevocable.'
  },
  {
    heading: 'Notice',
    text: 'You must ensure that everyone who gets a copy of any part of this software from you, with or without changes, also gets the text of this license.',
    common: true,
    note: 'Require copies of the license with copies of the software.'
  },
  {
    heading: 'Notice Forgiveness',
    text: [
      'If anyone notifies you in writing that you have not complied with Notices, you can keep your license by taking all practical steps to comply within 30 days after the notice.',
      'If you do not do so, your license ends immediately.'
    ].join(SENTENCE_SEPARATOR),
    needs: ['Notice'],
    note: 'Provide an out for notice violations.'
  },
  {
    heading: 'Credit',
    text: [
      'You must give this software and each contributor credit for contribution to other work, be they goods or services, that you produce or provide using this software.',
      'In general, you must give credit in such a way that the audience for your work can freely and readily find a written notice identifying this software, by name, as a contribution to your work, as well as each contributor, by name, as a contributor to this software.  You must not do anything to stop the audience for your work from sharing, publishing, or using credits.'
    ].join(SENTENCE_SEPARATOR),
    note: 'Require credit for work.'
  },
  {
    heading: 'Credit Conventions',
    needs: ['Credit'],
    text: [
      'If widespread convention dictates a particular way to give credit for your kind of work, such as by end credit, citation, acknowledgment, or billing, then follow that convention.',
      'For software provided in copies to run or install, give credit in documentation and notice files.',
      'For software provided as a web service, give credits in ',
      { code: 'credits.txt' },
      ', according to ',
      { url: 'https://creditstxt.com' },
      '.'
    ],
    note: 'Require credits in the conventional way for each medium.'
  },
  {
    heading: 'Right to Decline Credit',
    needs: ['Credit'],
    text: [
      'On written request from a contributor, you must remove their name from any credits you make available for work they do not want to be associated with going forward.',
      'On written request from all contributors to this software, you must do the same for the name of this software.'
    ].join(SENTENCE_SEPARATOR),
    note: 'Allow contributors to decline credit for specific uses.'
  },
  {
    heading: 'Disclaimer',
    conspicuous: true,
    text: 'As far as the law allows, this software comes as is, without any warranty or condition.',
    common: true,
    note: 'Disclaim all warranties.',
    hint: 'Strongly consider selecting Notices, as well.'
  },
  {
    heading: 'Exclusion',
    conspicuous: true,
    text: 'As far as the law allows, no contributor will be liable to anyone for any damages related to this software or this license, under any kind of legal claim.',
    common: true,
    note: 'Exclude all legal claims.',
    hint: 'Strongly consider selecting Notices, as well.'
  }
]

// Add empty array properties.
parts.forEach(function (part) {
  if (!part.needs) part.needs = []
  if (!part.conflicts) part.conflicts = []
})

// Validate needs and conflicts.
parts.forEach(function (part) {
  part.needs.forEach(function (heading) {
    if (!isValidHeading(heading)) {
      throw new Error(
        'Invalid heading "' + heading + '"' +
        ' in ' + part.heading + ' needs.'
      )
    }
  })
  part.conflicts.forEach(function (heading) {
    if (!isValidHeading(heading)) {
      throw new Error(
        'Invalid heading "' + heading + '"' +
        ' in ' + part.heading + ' conflicts.'
      )
    }
  })
})

function isValidHeading (heading) {
  return parts.some(function (part) {
    return part.heading === heading
  })
}

var TITLE = 'Sythesized License'

var URL = 'https://synth.kemitchell.com'

function renderLicense () {
  var selected = parts.filter(function (part) {
    return selections[part.heading] || part.required
  })

  renderBlockquote()
  renderCommonMark()

  function renderBlockquote () {
    var fragment = document.createDocumentFragment()

    var h1 = document.createElement('h1')
    h1.appendChild(document.createTextNode(TITLE))
    fragment.appendChild(h1)

    var url = document.createElement('a')
    url.href = URL
    url.appendChild(document.createTextNode(URL))
    fragment.appendChild(url)

    var version = document.createElement('p')
    version.appendChild(textNode('Version: ' + VERSION))
    fragment.appendChild(version)

    var contentsP = document.createElement('p')
    contentsP.appendChild(textNode('Contents:'))
    fragment.appendChild(contentsP)

    var ol = document.createElement('ol')
    selected.forEach(function (part) {
      var li = document.createElement('li')
      li.appendChild(textNode(part.heading))
      fragment.appendChild(li)
    })
    fragment.appendChild(ol)

    selected.forEach(function (part) {
      var h2 = document.createElement('h2')
      h2.appendChild(textNode(part.heading))
      fragment.appendChild(h2)

      var p = document.createElement('p')
      if (part.conspicuous) {
        p.className = 'conspicuous'
        p.style = 'font-weight: bold; font-style: italic;'
      }
      if (Array.isArray(part.text)) {
        part.text.forEach(function (element) {
          if (typeof element === 'string') {
            p.appendChild(textNode(element))
          } else if (element.code) {
            var code = document.createElement('code')
            code.appendChild(document.createTextNode(element.code))
            p.appendChild(code)
          } else if (element.url) {
            var a = document.createElement('a')
            a.href = element.url
            a.appendChild(document.createTextNode(element.url))
            p.appendChild(a)
          } else {
            throw new Error('invalid text element: ' + JSON.stringify(element))
          }
        })
      } else {
        p.appendChild(textNode(part.text))
      }
      fragment.appendChild(p)
    })

    blockquote.innerHTML = ''
    blockquote.appendChild(fragment)
  }

  function textNode (text) {
    return document.createTextNode(smarten(text))
  }

  function smarten (string) {
    return string.replace(/'/g, '’')
  }

  function renderCommonMark () {
    commonmark.innerText = [
      '# ' + TITLE,
      '<' + URL + '>',
      'Version: ' + VERSION,
      contents(),
      body()
    ].join('\n\n')

    function contents () {
      return 'Contents:\n' + selected
        .map(function (part) {
          return '- ' + part.heading
        })
        .join('\n')
    }

    function body () {
      return selected
        .map(function (part) {
          var text = '## ' + part.heading + '\n\n'
          var body
          if (Array.isArray(part.text)) {
            body = part.text
              .map(function (element) {
                if (typeof element === 'string') {
                  return element
                } else if (element.code) {
                  return '`' + element.code + '`'
                } else if (element.url) {
                  return '<' + element.url + '>'
                }
              })
              .join('')
          } else {
            body = part.text
          }
          if (part.conspicuous) {
            text += '***' + body + '***'
          } else {
            text += body
          }
          return text
        })
        .join('\n\n')
    }
  }
}
