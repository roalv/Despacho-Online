'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Users, Package, FileText, LayoutDashboard, User, LogOut, Plus, Search, Upload, Download, Trash2, Edit, Eye, FileCheck } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default function DespachoOnline() {
  const [currentView, setCurrentView] = useState('login')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Auth state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  
  // Data state
  const [clientes, setClientes] = useState([])
  const [despachos, setDespachos] = useState([])
  const [produtos, setProdutos] = useState([])
  const [documentos, setDocumentos] = useState([])
  const [pautaResults, setPautaResults] = useState([])
  
  // Selected items
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [selectedDespacho, setSelectedDespacho] = useState(null)
  
  // Form state
  const [clienteForm, setClienteForm] = useState({ nome: '', nif: '', telefone: '', email: '', endereco: '' })
  const [despachoForm, setDespachoForm] = useState({ clienteId: '', numeroSeries: '', estado: 'Em aberto' })
  const [produtoForm, setProdutoForm] = useState({ despachoId: '', nome: '', peso: '', quantidade: '', valor: '', codigo: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [pautaSearch, setPautaSearch] = useState('')
  
  // Dialogs
  const [showClienteDialog, setShowClienteDialog] = useState(false)
  const [showDespachoDialog, setShowDespachoDialog] = useState(false)
  const [showProdutoDialog, setShowProdutoDialog] = useState(false)

  // Fetch data functions
  const fetchClientes = async () => {
    const res = await fetch('/api/clientes')
    const data = await res.json()
    setClientes(data)
  }

  const fetchDespachos = async () => {
    const res = await fetch('/api/despachos')
    const data = await res.json()
    setDespachos(data)
  }

  const fetchProdutos = async () => {
    const res = await fetch('/api/produtos')
    const data = await res.json()
    setProdutos(data)
  }

  const fetchDocumentos = async () => {
    const res = await fetch('/api/documentos')
    const data = await res.json()
    setDocumentos(data)
  }

  const searchPauta = async (query) => {
    if (!query || query.trim() === '') {
      setPautaResults([])
      return
    }
    const res = await fetch(`/api/pauta?search=${encodeURIComponent(query)}`)
    const data = await res.json()
    setPautaResults(data)
  }

  useEffect(() => {
    if (pautaSearch) {
      const timer = setTimeout(() => {
        searchPauta(pautaSearch)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setPautaResults([])
    }
  }, [pautaSearch])

  // Auth functions
  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const action = isRegistering ? 'register' : 'login'
      const body = isRegistering ? { action, email, password, nome } : { action, email, password }
      
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const data = await res.json()
      
      if (data.error) {
        alert(data.error)
      } else {
        setUser(data.user)
        setCurrentView('dashboard')
        fetchClientes()
        fetchDespachos()
      }
    } catch (error) {
      alert('Erro na autenticação: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    })
    setUser(null)
    setCurrentView('login')
  }

  // Cliente functions
  const handleCreateCliente = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteForm)
      })
      
      const data = await res.json()
      
      if (data.error) {
        alert(data.error)
      } else {
        setShowClienteDialog(false)
        setClienteForm({ nome: '', nif: '', telefone: '', email: '', endereco: '' })
        fetchClientes()
        alert('Cliente criado com sucesso!')
      }
    } catch (error) {
      alert('Erro ao criar cliente: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCliente = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    
    const res = await fetch('/api/clientes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    
    if (res.ok) {
      fetchClientes()
      alert('Cliente excluído com sucesso!')
    }
  }

  const viewClienteDetails = async (id) => {
    const res = await fetch(`/api/clientes/${id}`)
    const data = await res.json()
    setSelectedCliente(data)
    setCurrentView('cliente-detalhes')
  }

  // File upload function
  const handleFileUpload = async (e, tipo, entityId) => {
    const file = e.target.files[0]
    if (!file) return
    
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', tipo === 'cliente' ? 'documentos-clientes' : 'documentos-despachos')
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const uploadData = await uploadRes.json()
      
      if (uploadData.error) {
        alert('Erro no upload: ' + uploadData.error)
        return
      }
      
      // Save document reference to database
      const endpoint = tipo === 'cliente' ? '/api/documentos-clientes' : '/api/documentos-despachos'
      const body = tipo === 'cliente' 
        ? { clienteId: entityId, fileUrl: uploadData.url, fileName: uploadData.originalName, fileType: file.type }
        : { despachoId: entityId, fileUrl: uploadData.url, fileName: uploadData.originalName, fileType: file.type }
      
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      alert('Documento enviado com sucesso!')
      
      // Refresh details
      if (tipo === 'cliente') {
        viewClienteDetails(entityId)
      } else {
        viewDespachoDetails(entityId)
      }
    } catch (error) {
      alert('Erro ao enviar documento: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Despacho functions
  const handleCreateDespacho = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/despachos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(despachoForm)
      })
      
      const data = await res.json()
      
      if (data.error) {
        alert(data.error)
      } else {
        setShowDespachoDialog(false)
        setDespachoForm({ clienteId: '', numeroSeries: '', estado: 'Em aberto' })
        fetchDespachos()
        alert('Despacho criado com sucesso!')
      }
    } catch (error) {
      alert('Erro ao criar despacho: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDespachoEstado = async (id, novoEstado) => {
    const res = await fetch('/api/despachos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado: novoEstado })
    })
    
    if (res.ok) {
      fetchDespachos()
      if (selectedDespacho?.id === id) {
        viewDespachoDetails(id)
      }
      alert('Estado atualizado!')
    }
  }

  const viewDespachoDetails = async (id) => {
    const res = await fetch(`/api/despachos/${id}`)
    const data = await res.json()
    setSelectedDespacho(data)
    setCurrentView('despacho-detalhes')
  }

  const handleDeleteDespacho = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este despacho?')) return
    
    const res = await fetch('/api/despachos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    
    if (res.ok) {
      fetchDespachos()
      alert('Despacho excluído com sucesso!')
    }
  }

  // Produto functions
  const handleCreateProduto = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...produtoForm,
          peso: parseFloat(produtoForm.peso) || 0,
          quantidade: parseInt(produtoForm.quantidade) || 0,
          valor: parseFloat(produtoForm.valor) || 0
        })
      })
      
      const data = await res.json()
      
      if (data.error) {
        alert(data.error)
      } else {
        setShowProdutoDialog(false)
        setProdutoForm({ despachoId: '', nome: '', peso: '', quantidade: '', valor: '', codigo: '' })
        setPautaSearch('')
        setPautaResults([])
        fetchProdutos()
        alert('Produto adicionado com sucesso!')
      }
    } catch (error) {
      alert('Erro ao adicionar produto: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduto = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    
    const res = await fetch('/api/produtos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    
    if (res.ok) {
      fetchProdutos()
      alert('Produto excluído com sucesso!')
    }
  }

  const selectHSCode = (codigo, descricao) => {
    setProdutoForm({ ...produtoForm, codigo: codigo })
    setPautaSearch(descricao)
    setPautaResults([])
  }

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text('Lista de Classificação', 14, 20)
    
    const tableData = produtos.map(p => [
      p.nome,
      p.codigo || 'N/A',
      `${p.peso} kg`,
      p.quantidade,
      `${p.valor} USD`,
      p.despachos?.clientes?.nome || 'N/A',
      p.despachos?.numeroSeries || 'N/A'
    ])
    
    doc.autoTable({
      head: [['Produto', 'HS Code', 'Peso', 'Qtd', 'Valor', 'Cliente', 'Nº Série']],
      body: tableData,
      startY: 30,
      theme: 'grid'
    })
    
    doc.save('classificacao.pdf')
  }

  // Filter functions
  const filteredClientes = clientes.filter(c => 
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nif?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDespachos = despachos.filter(d => 
    d.numeroSeries?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.clientes?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Login/Register View
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-600">Despacho Online</CardTitle>
            <CardDescription>Sistema de Gestão de Despachos Aduaneiros</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isRegistering && (
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required={isRegistering}
                    placeholder="Seu nome"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Aguarde...' : (isRegistering ? 'Criar Conta' : 'Entrar')}
              </Button>
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full text-sm text-blue-600 hover:underline"
              >
                {isRegistering ? 'Já tem conta? Entrar' : 'Não tem conta? Criar agora'}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main Dashboard Layout
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">Despacho Online</h1>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              currentView === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => { setCurrentView('clientes'); fetchClientes(); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              currentView === 'clientes' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users size={20} />
            <span>Clientes</span>
          </button>
          <button
            onClick={() => { setCurrentView('despachos'); fetchDespachos(); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              currentView === 'despachos' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Package size={20} />
            <span>Despachos</span>
          </button>
          <button
            onClick={() => { setCurrentView('classificacao'); fetchProdutos(); fetchDespachos(); fetchClientes(); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              currentView === 'classificacao' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileCheck size={20} />
            <span>Classificação</span>
          </button>
          <button
            onClick={() => { setCurrentView('documentos'); fetchDocumentos(); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              currentView === 'documentos' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText size={20} />
            <span>Documentos</span>
          </button>
          <button
            onClick={() => setCurrentView('perfil')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              currentView === 'perfil' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User size={20} />
            <span>Perfil</span>
          </button>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 text-blue-600" />
                      Clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-blue-600">{clientes.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="mr-2 text-green-600" />
                      Despachos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-green-600">{despachos.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileCheck className="mr-2 text-purple-600" />
                      Produtos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-purple-600">{produtos.length}</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Despachos Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {despachos.slice(0, 5).map(d => (
                      <div key={d.id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium font-mono">{d.numeroSeries}</p>
                          <p className="text-sm text-gray-500">{d.clientes?.nome}</p>
                        </div>
                        <Badge>{d.estado}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" onClick={() => { setCurrentView('clientes'); setShowClienteDialog(true); }}>
                      <Plus className="mr-2" size={16} />
                      Novo Cliente
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => { setCurrentView('despachos'); fetchClientes(); setShowDespachoDialog(true); }}>
                      <Plus className="mr-2" size={16} />
                      Novo Despacho
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => setCurrentView('classificacao')}>
                      <FileCheck className="mr-2" size={16} />
                      Ir para Classificação
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Clientes View */}
          {currentView === 'clientes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Clientes</h2>
                <Dialog open={showClienteDialog} onOpenChange={setShowClienteDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2" size={16} />
                      Novo Cliente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCliente} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cliente-nome">Nome Completo *</Label>
                          <Input
                            id="cliente-nome"
                            value={clienteForm.nome}
                            onChange={(e) => setClienteForm({ ...clienteForm, nome: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cliente-nif">NIF *</Label>
                          <Input
                            id="cliente-nif"
                            value={clienteForm.nif}
                            onChange={(e) => setClienteForm({ ...clienteForm, nif: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cliente-telefone">Telefone</Label>
                          <Input
                            id="cliente-telefone"
                            value={clienteForm.telefone}
                            onChange={(e) => setClienteForm({ ...clienteForm, telefone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cliente-email">Email</Label>
                          <Input
                            id="cliente-email"
                            type="email"
                            value={clienteForm.email}
                            onChange={(e) => setClienteForm({ ...clienteForm, email: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cliente-endereco">Endereço</Label>
                        <Textarea
                          id="cliente-endereco"
                          value={clienteForm.endereco}
                          onChange={(e) => setClienteForm({ ...clienteForm, endereco: e.target.value })}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Criando...' : 'Criar Cliente'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Search size={20} className="text-gray-400" />
                    <Input
                      placeholder="Buscar clientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>NIF</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClientes.map(cliente => (
                        <TableRow key={cliente.id}>
                          <TableCell className="font-medium">{cliente.nome}</TableCell>
                          <TableCell>{cliente.nif}</TableCell>
                          <TableCell>{cliente.telefone}</TableCell>
                          <TableCell>{cliente.email}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" onClick={() => viewClienteDetails(cliente.id)}>
                              <Eye size={14} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteCliente(cliente.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cliente Details View */}
          {currentView === 'cliente-detalhes' && selectedCliente && (
            <div>
              <Button variant="outline" className="mb-4" onClick={() => setCurrentView('clientes')}>
                ← Voltar
              </Button>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Detalhes do Cliente</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Nome</Label>
                    <p className="font-medium">{selectedCliente.nome}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">NIF</Label>
                    <p className="font-medium">{selectedCliente.nif}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Telefone</Label>
                    <p className="font-medium">{selectedCliente.telefone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Email</Label>
                    <p className="font-medium">{selectedCliente.email || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Endereço</Label>
                    <p className="font-medium">{selectedCliente.endereco || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Documentos</CardTitle>
                    <Label htmlFor={`upload-cliente-${selectedCliente.id}`} className="cursor-pointer">
                      <Button type="button" size="sm">
                        <Upload className="mr-2" size={14} />
                        Enviar Documento
                      </Button>
                    </Label>
                    <input
                      id={`upload-cliente-${selectedCliente.id}`}
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'cliente', selectedCliente.id)}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedCliente.documentos && selectedCliente.documentos.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCliente.documentos.map(doc => (
                        <div key={doc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <FileText size={20} className="text-blue-600" />
                            <div>
                              <p className="font-medium">{doc.fileName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <Download size={14} />
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nenhum documento enviado</p>
                  )}
                </CardContent>
              </Card>
              
              <Button className="mt-6" onClick={() => {
                setDespachoForm({ ...despachoForm, clienteId: selectedCliente.id })
                setShowDespachoDialog(true)
              }}>
                <Plus className="mr-2" size={16} />
                Criar Novo Despacho
              </Button>
            </div>
          )}

          {/* Despachos View */}
          {currentView === 'despachos' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Despachos</h2>
                <Dialog open={showDespachoDialog} onOpenChange={setShowDespachoDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => fetchClientes()}>
                      <Plus className="mr-2" size={16} />
                      Novo Despacho
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Despacho</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateDespacho} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="despacho-cliente">Cliente *</Label>
                        <Select value={despachoForm.clienteId} onValueChange={(value) => setDespachoForm({ ...despachoForm, clienteId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {clientes.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="despacho-series">Número de Série *</Label>
                        <Input
                          id="despacho-series"
                          value={despachoForm.numeroSeries}
                          onChange={(e) => setDespachoForm({ ...despachoForm, numeroSeries: e.target.value })}
                          required
                          placeholder="Ex: 2025/001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="despacho-estado">Estado</Label>
                        <Select value={despachoForm.estado} onValueChange={(value) => setDespachoForm({ ...despachoForm, estado: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Em aberto">Em aberto</SelectItem>
                            <SelectItem value="Em classificação">Em classificação</SelectItem>
                            <SelectItem value="Pronto">Pronto</SelectItem>
                            <SelectItem value="Concluído">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Criando...' : 'Criar Despacho'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Search size={20} className="text-gray-400" />
                    <Input
                      placeholder="Buscar despachos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Nº Série</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDespachos.map(despacho => (
                        <TableRow key={despacho.id}>
                          <TableCell className="font-medium">{despacho.clientes?.nome}</TableCell>
                          <TableCell className="font-mono">{despacho.numeroSeries || 'N/A'}</TableCell>
                          <TableCell>
                            <Select value={despacho.estado} onValueChange={(value) => handleUpdateDespachoEstado(despacho.id, value)}>
                              <SelectTrigger className="w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Em aberto">Em aberto</SelectItem>
                                <SelectItem value="Em classificação">Em classificação</SelectItem>
                                <SelectItem value="Pronto">Pronto</SelectItem>
                                <SelectItem value="Concluído">Concluído</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" onClick={() => viewDespachoDetails(despacho.id)}>
                              <Eye size={14} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteDespacho(despacho.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Despacho Details View */}
          {currentView === 'despacho-detalhes' && selectedDespacho && (
            <div>
              <Button variant="outline" className="mb-4" onClick={() => setCurrentView('despachos')}>
                ← Voltar
              </Button>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Detalhes do Despacho</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Cliente</Label>
                    <p className="font-medium">{selectedDespacho.clientes?.nome}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Número de Série</Label>
                    <p className="font-medium font-mono">{selectedDespacho.numeroSeries || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Estado</Label>
                    <Badge>{selectedDespacho.estado}</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Documentos</CardTitle>
                    <Label htmlFor={`upload-despacho-${selectedDespacho.id}`} className="cursor-pointer">
                      <Button type="button" size="sm">
                        <Upload className="mr-2" size={14} />
                        Enviar Documento
                      </Button>
                    </Label>
                    <input
                      id={`upload-despacho-${selectedDespacho.id}`}
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'despacho', selectedDespacho.id)}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedDespacho.documentos && selectedDespacho.documentos.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDespacho.documentos.map(doc => (
                        <div key={doc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <FileText size={20} className="text-blue-600" />
                            <div>
                              <p className="font-medium">{doc.fileName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <Download size={14} />
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nenhum documento enviado</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Classificados</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDespacho.produtos && selectedDespacho.produtos.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>HS Code</TableHead>
                          <TableHead>Peso (kg)</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedDespacho.produtos.map(p => (
                          <TableRow key={p.id}>
                            <TableCell>{p.nome}</TableCell>
                            <TableCell className="font-mono">{p.codigo || 'N/A'}</TableCell>
                            <TableCell>{p.peso}</TableCell>
                            <TableCell>{p.quantidade}</TableCell>
                            <TableCell>${p.valor}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nenhum produto classificado</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Classificação View */}
          {currentView === 'classificacao' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Classificação de Produtos</h2>
                <Dialog open={showProdutoDialog} onOpenChange={setShowProdutoDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { fetchDespachos(); fetchClientes(); }}>
                      <Plus className="mr-2" size={16} />
                      Adicionar Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Adicionar Produto para Classificação</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateProduto} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="produto-despacho">Despacho *</Label>
                        <Select value={produtoForm.despachoId} onValueChange={(value) => setProdutoForm({ ...produtoForm, despachoId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um despacho" />
                          </SelectTrigger>
                          <SelectContent>
                            {despachos.map(d => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.numeroSeries} - {d.clientes?.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="produto-nome">Nome do Produto *</Label>
                        <Input
                          id="produto-nome"
                          value={produtoForm.nome}
                          onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })}
                          required
                          placeholder="Digite o nome do produto"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="produto-peso">Peso (kg)</Label>
                          <Input
                            id="produto-peso"
                            type="number"
                            step="0.01"
                            value={produtoForm.peso}
                            onChange={(e) => setProdutoForm({ ...produtoForm, peso: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="produto-quantidade">Quantidade</Label>
                          <Input
                            id="produto-quantidade"
                            type="number"
                            value={produtoForm.quantidade}
                            onChange={(e) => setProdutoForm({ ...produtoForm, quantidade: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="produto-valor">Valor (USD)</Label>
                          <Input
                            id="produto-valor"
                            type="number"
                            step="0.01"
                            value={produtoForm.valor}
                            onChange={(e) => setProdutoForm({ ...produtoForm, valor: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pauta-search">Buscar HS Code (Pauta)</Label>
                        <Input
                          id="pauta-search"
                          value={pautaSearch}
                          onChange={(e) => setPautaSearch(e.target.value)}
                          placeholder="Digite para buscar código HS..."
                        />
                      </div>
                      {pautaResults.length > 0 && (
                        <ScrollArea className="h-48 border rounded p-2">
                          <div className="space-y-2">
                            {pautaResults.map(p => (
                              <div
                                key={p.id}
                                className="p-3 bg-blue-50 hover:bg-blue-100 rounded cursor-pointer transition"
                                onClick={() => selectHSCode(p.codigo, p.descricao)}
                              >
                                <p className="font-mono font-bold text-blue-600">{p.codigo}</p>
                                <p className="text-sm text-gray-700">{p.descricao}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="produto-hs">HS Code Selecionado</Label>
                        <Input
                          id="produto-hs"
                          value={produtoForm.codigo}
                          onChange={(e) => setProdutoForm({ ...produtoForm, codigo: e.target.value })}
                          placeholder="Código HS"
                          className="font-mono"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Adicionando...' : 'Adicionar Produto'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Lista de Produtos Classificados</CardTitle>
                    <Button onClick={exportPDF} variant="outline">
                      <Download className="mr-2" size={16} />
                      Exportar PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>HS Code</TableHead>
                        <TableHead>Peso (kg)</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Despacho</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produtos.map(produto => (
                        <TableRow key={produto.id}>
                          <TableCell className="font-medium">{produto.nome}</TableCell>
                          <TableCell className="font-mono text-blue-600">{produto.codigo || 'N/A'}</TableCell>
                          <TableCell>{produto.peso}</TableCell>
                          <TableCell>{produto.quantidade}</TableCell>
                          <TableCell>${produto.valor}</TableCell>
                          <TableCell>{produto.despachos?.clientes?.nome || 'N/A'}</TableCell>
                          <TableCell>{produto.despachos?.destino || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteProduto(produto.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Documentos View */}
          {currentView === 'documentos' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Todos os Documentos</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {documentos.map(doc => (
                      <div key={doc.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <FileText size={24} className="text-blue-600" />
                          <div>
                            <p className="font-medium">{doc.fileName}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Badge variant="outline">{doc.tipo}</Badge>
                              {doc.tipo === 'Cliente' && doc.clientes && (
                                <span>{doc.clientes.nome}</span>
                              )}
                              {doc.tipo === 'Despacho' && doc.despachos && (
                                <span>{doc.despachos.clientes?.nome} - {doc.despachos.destino}</span>
                              )}
                              <span>•</span>
                              <span>{new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <Download size={14} className="mr-2" />
                            Download
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Perfil View */}
          {currentView === 'perfil' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Perfil do Usuário</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-500">Email</Label>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Nome</Label>
                    <p className="font-medium">{user?.user_metadata?.nome || 'Não informado'}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <Button variant="destructive" onClick={handleLogout}>
                      <LogOut className="mr-2" size={16} />
                      Sair da Conta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}