/*
 * Copyright 2017 Samsung Electronics Co., Ltd. and other contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Util from './util';

export default class Surface {

  constructor() {
    this._sidenav = {
      opened: false,
      closedWidth: 40,
      openedWidth: 240,
    };

    this._sidenavExtra = {
      opened: false,
      last: '',
      newFile: {
        opened: false,
      },
      run: {
        enabled: false,
      },
    };

    this._panel = {
      numberOfInactive: 4,
      height: 100,
      backtrace: {
        active: true,
      },
      breakpoints: {
        active: true,
      },
      watch: {
        active: false,
      },
      chart: {
        active: false,
        width: 0,
        height: 0,
      },
      run: {
        active: false,
      },
      output: {
        active: false,
      },
      console: {
        active: true,
      },
    };
  }

  /**
   * Continue and Stop button state enumerations.
   */
  get CSICON() {
    return {
      STOP: 0,
      CONTINUE: 1,
    };
  }

  /**
   * Colors code for the jquery and bootsrtap elements.
   */
  get COLOR() {
    return {
      RED: 0,
      GREEN: 1,
      BLUE: 2,
      YELLOW: 3,
      WHITE: 4,
    };
  }

  /**
   * Types of the source sending panel update methods.
   */
  get RUN_UPDATE_TYPE() {
    return {
      ALL: 0,
      LIST: 1,
      BUTTON: 2,
      CR: 3,
      JQUI: 4,
    };
  }

  /**
   * Returns the actual state of the left side menu.
   *
   * @return {boolean} True if the left side menu is opened, false otherwise.
   */
  isSidenavOpened() {
    return this._sidenav.opened;
  }

  /**
   * Closes or opens the left side menu.
   */
  toggleSidenav(chart) {
    if (this._sidenav.opened) {
      this._sidenav.opened = false;
      $('#left-sidenav').css('width', this._sidenav.closedWidth + 'px');
      $('#main-wrapper').css('margin-left', this._sidenav.closedWidth + 'px');
    } else {
      this._sidenav.opened = true;
      $('#left-sidenav').css('width', this._sidenav.openedWidth + 'px');
      $('#main-wrapper').css('margin-left', this._sidenav.openedWidth + 'px');
    }

    if (this.getPanelProperty('chart.active')) {
      this._panel.chart.height = $('#chart-wrapper').height();
      this._panel.chart.width = $('#chart-wrapper').width();
      chart.resizeChart(this._panel.chart.height, this._panel.chart.width);
    }

    if (this.getPanelProperty('backtrace.active')) {
      $('#backtrace-table').floatThead('reflow');
    }

    if (this.getPanelProperty('breakpoints.active')) {
      $('#breakpoints-table').floatThead('reflow');
    }
  }

  /**
   * Returns of the opened state of the sidenav extra panel.
   *
   * @return {boolean} True if the extra sidenav opened, flase otherwise.
   */
  isSidenavExtraOpened() {
    return this._sidenavExtra.opened;
  }

  /**
   * Enables or disables a specified menu based on the given type.
   *
   * @param {string} extra ID of the menu.
   */
  toggleSidenavExtra(extra) {
    let splt = extra.split('-')[0];

    if (this._sidenavExtra.opened) {
      if (this._sidenavExtra.last === extra) {
        this._sidenavExtra.opened = false;
        $('#sidenav-extra-modal').hide();
        $('.sidenav-extra').hide();
        $(`#${extra}`).hide();

        $(`#sidenav-toggle-${splt}`).removeClass('active-sidenav-button');
      } else {
        $(`#${this._sidenavExtra.last}`).hide();
        $(`#${extra}`).show();

        $(`#sidenav-toggle-${this._sidenavExtra.last.split('-')[0]}`).removeClass('active-sidenav-button');
        $(`#sidenav-toggle-${splt}`).addClass('active-sidenav-button');
      }

      if (this._sidenavExtra.newFile.opened) {
        this._sidenavExtra.newFile.opened = false;
        $('#hidden-new-file').hide();
      }
    } else {
      this._sidenavExtra.opened = true;
      $('#sidenav-extra-modal').show();
      $('.sidenav-extra').show();
      $(`#${extra}`).show();

      $(`#sidenav-toggle-${splt}`).addClass('active-sidenav-button');
    }

    this._sidenavExtra.last = extra;
  }

  /**
   * Enables or disables the new file submenu in the file menu.
   */
  toggleSidenavNewFile() {
    if (this._sidenavExtra.newFile.opened) {
      this._sidenavExtra.newFile.opened = false;

      $('#hidden-new-file').hide();
      $('#new-file-name').val('');
      $('#hidden-new-file-info').empty();
    } else {
      this._sidenavExtra.newFile.opened = true;
      $('#hidden-new-file').fadeIn('fast');
    }
  }

  /**
   * Enables or disables an information panel on the page left side.
   *
   * @param {string} target Name of the panel.
   * @param {object} chart Chart object if the target is the chart.
   */
  togglePanel(target, chart = null) {
    if (this._panel[target].active) {
      if (target === 'chart' && chart !== null) {
        this.toggleButton(false, 'export-chart-button');
      }

      this._panel[target].active = false;

      $(`#sidenav-toggle-${target}`).removeClass('active-sidenav-button');

      $(`#${target}-wrapper`).hide();
      $(`#${target}-wrapper`).addClass('hidden-panel');
      this._panel.numberOfInactive++;
    } else {
      if (target === 'chart' && chart !== null) {
        chart.initChart();
        this.toggleButton(true, 'export-chart-button');
      }

      this._panel[target].active = true;

      $(`#sidenav-toggle-${target}`).addClass('active-sidenav-button');

      $(`#${target}-wrapper`).show();
      $(`#${target}-wrapper`).removeClass('hidden-panel');
      this._panel.numberOfInactive--;
    }

    if (this.getPanelProperty('backtrace.active')) {
      $('#backtrace-table').floatThead('reflow');
    }

    if (this.getPanelProperty('breakpoints.active')) {
      $('#breakpoints-table').floatThead('reflow');
    }

    // If every information panels are hidden then expand the editor.
    // -1 from the length because of the resizable div element.
    if (this._panel.numberOfInactive === this.getPanelsNumber()) {
      $('#editor-wrapper').css('width', '100%');
      $('#editor-wrapper').css('padding-left', 0);
      $('#info-panels').hide();

      // If there is at least one information panel then reset the last known layout.
    } else if (this._panel.numberOfInactive > 0 && !$('#info-panels').is(':visible')) {
      $('#editor-wrapper').css('padding-left', 10);
      $('#editor-wrapper').css('width', this.editorHorizontalPercentage() + '%');
      $('#info-panels').show();
    }

    this.resetPanelsPercentage();

    $('.vertical-resizable').not('.hidden-panel').each((index, element) => {
      if (index === 0) {
        $(element).children('.col-md-12').css('padding-top', 0);
      } else {
        $(element).children('.col-md-12').css('padding-top', 10);
      }

      if (index === ($('.vertical-resizable').not('.hidden-panel').length - 1)) {
        $(element).children('.ui-resizable-s').hide();
      } else {
        $(element).children('.ui-resizable-s').show();
      }
    });

    if (this._panel.chart.active) {
      this._panel.chart.height = $('#chart-wrapper').height();
      this._panel.chart.width = $('#chart-wrapper').width();
      chart.resizeChart(this._panel.chart.height, this._panel.chart.width);
    }
  }

  /**
   * Enables or disables a button element.
   *
   * @param {boolean} enabled New state of the button.
   * @param {string} element The id of the selected button.
   */
  toggleButton(enabled, element) {
    if (enabled) {
      $('#' + element).removeClass('disabled');
    } else {
      $('#' + element).addClass('disabled');
    }
  }

  /**
   * Returns a porperty from the panel object based on the path argument.
   *
   * @param {string} path Dot spearated path to the property value.
   * @return {mixed} Property value if that is exists, null otherwise.
   */
  getPanelProperty(path) {
    if (path) {
      path = path.split('.');
    } else {
      return null;
    }

    if (path.length === 2 && this._panel[path[0]][path[1]] !== undefined) {
      return this._panel[path[0]][path[1]];
    }

    if (path.length === 1 && this._panel[path[0]] !== undefined) {
      return this._panel[path[0]];
    }

    return null;
  }

  /**
   * Appends a new li element to the source file chooser source or destonation placeholder.
   *
   * @param {object} element The jquery element of the placeholder.
   * @param {string} liClass Extra css classes for the li.
   * @param {string} divClass Extra css classes for the inner div.
   * @param {string} id Dom element id.
   * @param {integer} sid Session if of a file.
   * @param {string} text String to display as a name on the list item.
   */
  appendChooserLi(element, liClass, divClass, id, sid, text) {
    element.append($(
      `<li class="bg-white cupload ${liClass}" id="${id}" data-sid="${sid}">` +
        `<span>${text}</span>` +
        `<div class="handle ${divClass}">` +
          '<i class="fa fa-circle"></i>' +
        '</div>' +
      '</li>'
    ));
  }

  /**
   * Changes the color of the selected element from the upload list.
   *
   * @param {integer} color The color code.
   * @param {integer} sid Session ID's of the selected item.
   */
  changeUploadColor(color, sid) {
    let e = $(`li.cupload[data-sid="${sid}"]`);

    switch (color) {
      case this.COLOR.RED:
        e.toggleClass('bg-danger');
        break;
      case this.COLOR.YELLOW:
        e.toggleClass('bg-warning');
        break;
      case this.COLOR.GREEN:
        e.toggleClass('bg-success');
        break;
      case this.COLOR.WHITE:
      default:
        e.toggleClass('bg-white');
        break;
    }
  }

  /**
   * Updates the Source sending panel content based on the requested update mode.
   * - Clears and refills the source and destonation selectable lists.
   * - Updates the buttons in the panel.
   * - Changes colors in the upload list items after context reset request.
   * - Enables or disables the lists based on the current state of the Upload.
   *
   * @param {integer} type Type of the update mode.
   * @param {object} debuggerObj The main DebuggerClient module instance.
   * @param {object} session The main Session module instance.
   */
  updateRunPanel(type, debuggerObj, session) {
    let $src = $('#run-chooser-src');
    let $dest = $('#run-chooser-dest');
    let ok = 'run-ok-button';
    let clear = 'run-clear-button';
    let right = 'run-right-button';
    let left = 'run-left-button';

    if (type === this.RUN_UPDATE_TYPE.ALL || type === this.RUN_UPDATE_TYPE.LIST) {
      // Empty the lists.
      $src.html('');
      $dest.html('');

      session.getAllData().forEach((s) => {
        // Skip the welcome session, which is always stored with id 0.
        if (s.id === 0) {
          return;
        }

        if (!s.scheduled) {
          // Create a new list item.
          this.appendChooserLi($src, '', 'hidden', 'run-' + s.name, s.id, s.name);
        }
      });

      // Generate the ordered list and fill the destonation field based on the file state.
      let list = session.getUploadBackupList();

      if (list.length) {
        for (let i in list) {
          if (list.hasOwnProperty(i)) {
            let ss = session.getFileDataById(list[i]);

            if (list[i] === 0) {
              this.appendChooserLi($dest, '', 'hidden', 'run-context-reset-sid', 0, 'Context Reset');
            } else {
              this.appendChooserLi($dest, 'sortable', '', 'run-' + ss.name, ss.id, ss.name);
            }

            if (!session.isFileInUploadList(list[i]) && session.getUploadBackupList().indexOf(list[i]) != -1) {
              this.changeUploadColor(this.COLOR.GREEN, list[i]);
            }
          }
        }
      }
    }

    if (type === this.RUN_UPDATE_TYPE.CR) {
      $dest.children('li').each((i, e) => {
        if (!$(e).hasClass('bg-success') && $(e).data('sid') != 0) {
          this.changeUploadColor(this.COLOR.RED, $(e).data('sid'));
        }
      });
    }

    if (type === this.RUN_UPDATE_TYPE.ALL || type === this.RUN_UPDATE_TYPE.BUTTON) {
      if (session.isUploadStarted()) {
        // Disable the clear and the run button.
        this.toggleButton(false, ok);
        this.toggleButton(false, clear);
        this.toggleButton(false, right);
        this.toggleButton(false, left);

        // Enable the context reset button.
        this.toggleButton(true, 'run-context-reset-button');
      } else {
        if (!$src.is(':empty')) {
          this.toggleButton(true, right);
        } else {
          this.toggleButton(false, right);
        }

        if (!$dest.is(':empty')) {
          this.toggleButton(true, left);
          this.toggleButton(true, clear);
        } else {
          this.toggleButton(false, left);
          this.toggleButton(false, clear);
        }

        // Enable the run button if there is a connection and a source in the list.
        if (debuggerObj &&
            debuggerObj.getEngineMode() === debuggerObj.ENGINE_MODE.CLIENT_SOURCE &&
            session.isUploadAndRunAllowed() &&
            !session.isUploadStarted() &&
            !$dest.is(':empty')) {
          this.toggleButton(true, ok);
        } else {
          this.toggleButton(false, ok);
        }
      }
    }

    if (type === this.RUN_UPDATE_TYPE.ALL || type === this.RUN_UPDATE_TYPE.JQUI) {
      if (session.isUploadStarted()) {
        // Disable the sortable and selectable ul element.
        $dest.sortable('disable');
        $dest.selectable('disable');
        $src.selectable('disable');

        $src.css('opacity', 0.7);
        $dest.css('opacity', 0.7);
      } else {
        // Disable the sortable and selectable ul element.
        $dest.sortable('enable');
        $dest.selectable('enable');
        $src.selectable('enable');

        $src.css('opacity', 1);
        $dest.css('opacity', 1);
      }
    }
  }

  /**
   * Updates the watch panel list with the provided list.
   * - First off all make the watch panel empty.
   * - Then walks trhough the list and creates a new list item for every element.
   *
   * @param {array} list The list of the watch expressions.
   */
  updateWatchPanelList(list) {
    if (list) {
      $('#watch-list').html('');

      for (let expr in list) {
        if (list.hasOwnProperty(expr)) {
          this.appendWatchLi(expr, list[expr]);
        }
      }
    }
  }

  /**
   * Appends a new list item to the watch panel unordered list.
   * The new item contains the expression, the expression's value and a remove button at the end of the line.
   *
   * @param {string} expr The watched expression.
   * @param {string} value value of the watched expression.
   */
  appendWatchLi(expr, value) {
    $('#watch-list').append($(
      '<li>' +
        `<span>${expr} : </span>` +
        `<span>${value}</span>` +
        `<div class="watch-li-remove" data-rid="${expr}" title="Remove Expression">` +
          '<i class="fa fa-minus"></i>' +
        '</div>' +
      '</li>'
    ));
  }

  /**
   * Updates the watch panel button based on the current state of the panel and the Debugger Client.
   *
   * @param {object} debuggerObj The Debugger Client module instance.
   */
  updateWatchPanelButtons(debuggerObj) {
    if (debuggerObj &&
        debuggerObj.getEngineMode() === debuggerObj.ENGINE_MODE.BREAKPOINT &&
        !$('#watch-list').is(':empty')) {
      this.toggleButton(true, 'watch-refresh-button');
    } else {
      this.toggleButton(false, 'watch-refresh-button');
    }

    if ($('#watch-list').is(':empty')) {
      this.toggleButton(false, 'watch-clear-button');
    } else {
      this.toggleButton(true, 'watch-clear-button');
    }
  }

  /**
   * Sets the chart panel width property.
   *
   * @param {number} width New width value.
   */
  setChartPanelWidth(width) {
    this._panel.chart.width = width;
  }

  /**
   * Sets the chart panel height property.
   *
   * @param {number} height New height value.
   */
  setChartPanelHeight(height) {
    this._panel.chart.height = height;
  }

  /**
   * Returns the view percentage of the editor wrapper.
   */
  editorHorizontalPercentage() {
    return (($('#workspace-wrapper').width() - $('#info-panels').width()) / $('#workspace-wrapper').width()) * 100;
  }

  /**
   * Continue execution dependency.
   *
   * @param {object} debuggerObj The Jerry client object.
   */
  continueCommand(debuggerObj) {
    this.continueStopButtonState(this.CSICON.STOP);
    $('#step-button').addClass('disabled');
    $('#next-button').addClass('disabled');

    debuggerObj.sendResumeExec(debuggerObj.CLIENT_PACKAGE.JERRY_DEBUGGER_CONTINUE);
  }

  /**
   * Stop execution releated buttons changes.
   */
  stopCommand() {
    this.continueStopButtonState(this.CSICON.CONTINUE);
    $('#step-button').removeClass('disabled');
    $('#next-button').removeClass('disabled');
  }

  /**
   * Disables or enables the available action buttons based on the given parameter.
   *
   * @param {boolean} disable New status of the action buttons.
   */
  disableActionButtons(disable) {
    if (disable) {
      // Disable the debugger action buttons.
      $('.debugger-action-button').each((i, e) => {
        $(e).addClass('disabled');
      });
    } else {
      // Enable the debugger action buttons.
      $('.debugger-action-button').each((i, e) => {
        $(e).removeClass('disabled');
      });
    }
  }

  /**
   * Sets to the proper state the Continue/Stop action button.
   *
   * @param {integer} state New state of the continue/stop button (CSICON item).
   */
  continueStopButtonState(state) {
    switch (state) {
      case this.CSICON.STOP:
        {
          $('#continue-stop-button i').removeClass('fa-play');
          $('#continue-stop-button i').addClass('fa-stop');
        }
        break;
      case this.CSICON.CONTINUE:
        {
          $('#continue-stop-button i').removeClass('fa-stop');
          $('#continue-stop-button i').addClass('fa-play');
        }
        break;
    }
  }

  /**
   * Generate a function backtrace log for the backtrace and breakpoint panel
   * based on the available line information.
   *
   * @param {object} info A complete breakpoint from the debuggerObj.
   * @return {string}
   */
  generateFunctionLog(info) {
    let suffix = `() at line: ${info.func.line}, col: ${info.func.column}`;

    if (!info.func.name && !info.func.is_func) {
      return '-';
    } else if (!info.func.name && info.func.is_func) {
      return `function${suffix}`;
    } else {
      return info.func.name + suffix;
    }
  }

  /**
   * Updates the backtrace panel with a new entry.
   *
   * @param {integer} frame Frame number information.
   * @param {object} info Breakpoint information from the debuggerObj.
   */
  updateBacktracePanel(frame, info) {
    let sourceName = info.func.sourceName || info;
    let line = info.line || '-';
    let $table = $('#backtrace-table-body');

    $table.append(
      '<tr>' +
        `<td>${frame}</td>` +
        `<td>${sourceName}</td>` +
        `<td>${line}</td>` +
        `<td>${this.generateFunctionLog(info)}</td>` +
      '</tr>'
    );

    Util.scrollDown($table);
  }

  /**
   * Updates the breakpoint panel based on the active breakpoints.
   *
   * @param {array} activeBreakpoints Currently active (inserted) breakpoints list.
   */
  updateBreakpointsPanel(activeBreakpoints) {
    let $table = $('#breakpoints-table-body');
    Util.clearElement($table);

    for (let i in activeBreakpoints) {
      if (activeBreakpoints.hasOwnProperty(i)) {
        let sourceName = activeBreakpoints[i].func.sourceName || '-',
        line = activeBreakpoints[i].line || '-',
        id = activeBreakpoints[i].activeIndex || '-';

        $table.append(
          '<tr>' +
            `<td>${sourceName}</td>` +
            `<td>${line}</td>` +
            `<td>${id}</td>` +
            `<td>${this.generateFunctionLog(activeBreakpoints[i])}</td>` +
          '</tr>'
        );
      }
    }

    Util.scrollDown($table);
  }

  /**
   * Sets the info panels height based on the visible panel number.
   */
  resetPanelsPercentage() {
    $('.vertical-resizable').css('height', (100 / this.getPanelsDivisor()) + '%');
  }

  /**
   * Returns with the total number of the info panels.
   *
   * @return {integer}
   */
  getPanelsNumber() {
    return $('#info-panels').children().length - 1;
  }

  /**
   * Returns with the number of the visible info panels.
   *
   * @return {integer}
   */
  getPanelsDivisor() {
    return this.getPanelsNumber() - this._panel.numberOfInactive;
  }

  /**
   * Gets the backtrace depth options from the settings page and send that to the debugger.
   *
   * @param {object} debuggerObj The Jerry client object.
   */
  getBacktrace(debuggerObj) {
    let max_depth = 0;
    let user_depth = $('#backtrace-depth').val();

    if (user_depth !== 0) {
      if (/[1-9][0-9]*/.test(user_depth)) {
        max_depth = parseInt(user_depth);
      }
    }

    if (debuggerObj.getEngineMode() === debuggerObj.ENGINE_MODE.BREAKPOINT) {
      debuggerObj.encodeMessage('BI', [debuggerObj.CLIENT_PACKAGE.JERRY_DEBUGGER_GET_BACKTRACE, max_depth]);
    }
  }

  /**
   * Updates the ace editor height based on the height of the wrapper and the file tabs header.
   */
  updateEditorHeight() {
    $('#editor').height($('#editor-wrapper').height() - $('#file-tabs').height() - 3);
  }

  /**
   * Sets back every action to the default state.
   */
  reset() {
    this.toggleButton(false, 'run-context-reset-button');
  }
}
