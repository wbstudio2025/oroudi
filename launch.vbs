' Dural Nafis Quotation Editor - launcher.
' Starts the local PowerShell server (hidden, only if it isn't already running) and opens
' the editor in a clean Microsoft Edge "app mode" window. Double-click target for the
' desktop / Start Menu shortcut created by setup.bat.

Option Explicit
Dim sh, fso, scriptDir, port, baseUrl, edge, serverPs1
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
port = "8137"
baseUrl = "http://127.0.0.1:" & port & "/"
serverPs1 = scriptDir & "\server.ps1"

' --- locate Microsoft Edge ---
edge = FindEdge()
If edge = "" Then
  MsgBox "تعذّر العثور على متصفح Microsoft Edge على هذا الجهاز." & vbCrLf & _
         "Microsoft Edge is required but was not found.", vbCritical, "Dural Nafis Quotation Editor"
  WScript.Quit 1
End If

' --- start the local server only if it is not already responding ---
If Not ServerUp(baseUrl) Then
  sh.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & serverPs1 & """", 0, False
  ' wait (up to ~10s) for it to come up
  Dim tries
  For tries = 1 To 50
    WScript.Sleep 200
    If ServerUp(baseUrl) Then Exit For
  Next
End If

' --- open the editor in an Edge app window ---
sh.Run """" & edge & """ --app=" & baseUrl, 1, False

Function FindEdge()
  Dim candidates, i, p
  candidates = Array( _
    sh.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Microsoft\Edge\Application\msedge.exe", _
    sh.ExpandEnvironmentStrings("%ProgramFiles%") & "\Microsoft\Edge\Application\msedge.exe", _
    sh.ExpandEnvironmentStrings("%LocalAppData%") & "\Microsoft\Edge\Application\msedge.exe")
  FindEdge = ""
  For i = 0 To UBound(candidates)
    p = candidates(i)
    If fso.FileExists(p) Then
      FindEdge = p
      Exit Function
    End If
  Next
End Function

Function ServerUp(url)
  Dim http
  ServerUp = False
  On Error Resume Next
  Set http = CreateObject("MSXML2.XMLHTTP")
  http.Open "GET", url, False
  http.Send
  If Err.Number = 0 And http.Status = 200 Then ServerUp = True
  On Error GoTo 0
End Function
