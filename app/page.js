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
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import toast, { Toaster } from 'react-hot-toast'

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
  const [despachoForm, setDespachoForm] = useState({ clienteId: '', numeroSeries: '', estado: 'Faltando Documento' })
  const [produtoForm, setProdutoForm] = useState({ despachoId: '', nome: '', peso: '', quantidade: '', valor: '', codigo: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [pautaSearch, setPautaSearch] = useState('')
  
  // Editing state
  const [editingCliente, setEditingCliente] = useState(null)
  const [editingDespacho, setEditingDespacho] = useState(null)
  const [editingProduto, setEditingProduto] = useState(null)
  const [editingPauta, setEditingPauta] = useState(null)
  const [editingUser, setEditingUser] = useState(false)
  const [userForm, setUserForm] = useState({ email: '', nome: '', password: '' })
  
  // Dialogs
  const [showClienteDialog, setShowClienteDialog] = useState(false)
  const [showDespachoDialog, setShowDespachoDialog] = useState(false)
  const [showProdutoDialog, setShowProdutoDialog] = useState(false)
  const [showPautaDialog, setShowPautaDialog] = useState(false)
  
  // Pauta form
  const [pautaForm, setPautaForm] = useState({ codigo: '', descricao: '' })
  
  // Filtro de classificação
  const [filtroClassificacao, setFiltroClassificacao] = useState('')
  
  // Filtro de documentos
  const [filtroDocumentos, setFiltroDocumentos] = useState('')

  // Fetch data functions
  const fetchClientes = async () => {
    if (!user?.id) return
    const res = await fetch('/api/clientes', {
      headers: { 'x-user-id': user.id }
    })
    const data = await res.json()
    setClientes(data)
  }

  const fetchDespachos = async () => {
    if (!user?.id) return
    const res = await fetch('/api/despachos', {
      headers: { 'x-user-id': user.id }
    })
    const data = await res.json()
    setDespachos(data)
  }

  const fetchProdutos = async () => {
    if (!user?.id) return
    const res = await fetch('/api/produtos', {
      headers: { 'x-user-id': user.id }
    })
    const data = await res.json()
    setProdutos(data)
  }

  const fetchDocumentos = async () => {
    if (!user?.id) return
    const res = await fetch('/api/documentos', {
      headers: { 'x-user-id': user.id }
    })
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

  // Carregar TODOS os dados quando o usuário fizer login
  useEffect(() => {
    if (user) {
      // Carregar todos os dados quando o usuário estiver logado
      fetchClientes()
      fetchDespachos()
      fetchProdutos()
      fetchDocumentos()
    }
  }, [user])
  
  // Recarregar dados específicos quando mudar de view
  useEffect(() => {
    if (user && currentView === 'clientes') {
      fetchClientes()
    }
    if (user && currentView === 'despachos') {
      fetchDespachos()
    }
    if (user && currentView === 'classificacao') {
      fetchProdutos()
      fetchDespachos()
      fetchClientes()
    }
    if (user && currentView === 'documentos') {
      fetchDocumentos()
    }
  }, [user, currentView])

  // Função para limpar todos os dados
  const clearAllData = () => {
    setClientes([])
    setDespachos([])
    setProdutos([])
    setDocumentos([])
    setPautaResults([])
    setSelectedCliente(null)
    setSelectedDespacho(null)
    setClienteForm({ nome: '', nif: '', telefone: '', email: '', endereco: '' })
    setDespachoForm({ clienteId: '', numeroSeries: '', estado: 'Faltando Documento' })
    setProdutoForm({ despachoId: '', nome: '', peso: '', quantidade: '', valor: '', codigo: '' })
    setSearchTerm('')
    setPautaSearch('')
    setEditingCliente(null)
    setEditingDespacho(null)
    setEditingProduto(null)
    setEditingPauta(null)
    setEditingUser(false)
    setUserForm({ email: '', nome: '', password: '' })
    setFiltroClassificacao('')
    setFiltroDocumentos('')
  }

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
        toast.error(data.error)
      } else {
        // Limpar todos os dados antes de definir o novo usuário
        clearAllData()
        
        // Definir novo usuário
        setUser(data.user)
        setCurrentView('dashboard')
        
        // Carregar dados do novo usuário
        toast.success('Login realizado com sucesso!')
      }
    } catch (error) {
      toast.error('Erro na autenticação: ' + error.message)
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
    
    // Limpar todos os dados ao fazer logout
    clearAllData()
    setUser(null)
    setCurrentView('login')
    toast.success('Logout realizado com sucesso!')
  }

  // Cliente functions
  const handleCreateCliente = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(clienteForm)
      })
      
      const data = await res.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setShowClienteDialog(false)
        setClienteForm({ nome: '', nif: '', telefone: '', email: '', endereco: '' })
        fetchClientes()
        toast.success('Cliente criado com sucesso!')
      }
    } catch (error) {
      toast.error('Erro ao criar cliente: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCliente = async (id) => {
    setLoading(true)
    
    try {
      // Enviar apenas os campos permitidos
      const updates = {
        id,
        nome: editingCliente.nome,
        nif: editingCliente.nif,
        telefone: editingCliente.telefone,
        email: editingCliente.email,
        endereco: editingCliente.endereco || ''
      }
      
      const res = await fetch('/api/clientes', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(updates)
      })
      
      const data = await res.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setEditingCliente(null)
        fetchClientes()
        toast.success('Cliente atualizado com sucesso!')
      }
    } catch (error) {
      toast.error('Erro ao atualizar cliente: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCliente = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    
    const res = await fetch('/api/clientes', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify({ id })
    })
    
    if (res.ok) {
      fetchClientes()
      toast.success('Cliente excluído com sucesso!')
    }
  }

  const viewClienteDetails = async (id) => {
    const res = await fetch(`/api/clientes/${id}`, {
      headers: { 'x-user-id': user.id }
    })
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
        toast.error('Erro no upload: ' + uploadData.error)
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
      
      toast.success('Documento enviado com sucesso!')
      
      // Refresh details
      if (tipo === 'cliente') {
        viewClienteDetails(entityId)
      } else {
        viewDespachoDetails(entityId)
      }
    } catch (error) {
      toast.success('Erro ao enviar documento: ' + error.message)
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
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(despachoForm)
      })
      
      const data = await res.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setShowDespachoDialog(false)
        setDespachoForm({ clienteId: '', numeroSeries: '', estado: 'Faltando Documento' })
        fetchDespachos()
        toast.success('Despacho criado com sucesso!')
      }
    } catch (error) {
      toast.success('Erro ao criar despacho: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDespacho = async (id) => {
    setLoading(true)
    
    try {
      // Enviar apenas os campos permitidos
      const updates = {
        id,
        clienteId: editingDespacho.clienteId,
        numeroSeries: editingDespacho.numeroSeries,
        estado: editingDespacho.estado
      }
      
      const res = await fetch('/api/despachos', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(updates)
      })
      
      const data = await res.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setEditingDespacho(null)
        fetchDespachos()
        toast.success('Despacho atualizado com sucesso!')
      }
    } catch (error) {
      toast.error('Erro ao atualizar despacho: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDespachoEstado = async (id, novoEstado) => {
    const res = await fetch('/api/despachos', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify({ id, estado: novoEstado })
    })
    
    if (res.ok) {
      fetchDespachos()
      if (selectedDespacho?.id === id) {
        viewDespachoDetails(id)
      }
      toast.success('Estado atualizado!')
    }
  }

  const viewDespachoDetails = async (id) => {
    const res = await fetch(`/api/despachos/${id}`, {
      headers: { 'x-user-id': user.id }
    })
    const data = await res.json()
    setSelectedDespacho(data)
    setCurrentView('despacho-detalhes')
  }

  const handleDeleteDespacho = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este despacho?')) return
    
    const res = await fetch('/api/despachos', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify({ id })
    })
    
    if (res.ok) {
      fetchDespachos()
      toast.success('Despacho excluído com sucesso!')
    }
  }

  // Produto functions
  const handleCreateProduto = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          ...produtoForm,
          peso: parseFloat(produtoForm.peso) || 0,
          quantidade: parseInt(produtoForm.quantidade) || 0,
          valor: parseFloat(produtoForm.valor) || 0
        })
      })
      
      const data = await res.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        // Manter o dialog aberto e apenas limpar os campos, mantendo o despachoId
        const currentDespachoId = produtoForm.despachoId
        setProdutoForm({ despachoId: currentDespachoId, nome: '', peso: '', quantidade: '', valor: '', codigo: '' })
        setPautaSearch('')
        setPautaResults([])
        fetchProdutos()
        toast.success('Produto adicionado com sucesso! Pode adicionar outro.')
      }
    } catch (error) {
      toast.success('Erro ao adicionar produto: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProduto = async (id) => {
    setLoading(true)
    
    try {
      // Enviar apenas os campos permitidos
      const updates = {
        id,
        nome: editingProduto.nome,
        codigo: editingProduto.codigo,
        peso: parseFloat(editingProduto.peso) || 0,
        quantidade: parseInt(editingProduto.quantidade) || 0,
        valor: parseFloat(editingProduto.valor) || 0
      }
      
      const res = await fetch('/api/produtos', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(updates)
      })
      
      const data = await res.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setEditingProduto(null)
        fetchProdutos()
        toast.success('Produto atualizado com sucesso!')
      }
    } catch (error) {
      toast.error('Erro ao atualizar produto: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduto = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    
    const res = await fetch('/api/produtos', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify({ id })
    })
    
    if (res.ok) {
      fetchProdutos()
      toast.success('Produto excluído com sucesso!')
    }
  }

  const selectHSCode = (codigo, descricao) => {
    setProdutoForm({ ...produtoForm, codigo: codigo })
    setPautaSearch(descricao)
    setPautaResults([])
  }

  // Pauta functions
  const handleCreatePauta = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/pauta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pautaForm)
      })
      
      const data = await res.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setShowPautaDialog(false)
        setPautaForm({ codigo: '', descricao: '' })
        toast.success('Código adicionado à pauta com sucesso!')
      }
    } catch (error) {
      toast.error('Erro ao adicionar código: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePauta = async (codigo) => {
    setLoading(true)
    
    try {
      const res = await fetch('/api/pauta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, ...editingPauta })
      })
      
      const data = await res.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setEditingPauta(null)
        searchPauta(pautaSearch)
        toast.success('Código atualizado com sucesso!')
      }
    } catch (error) {
      toast.error('Erro ao atualizar código: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePauta = async (codigo) => {
    if (!confirm('Tem certeza que deseja excluir este código?')) return
    
    const res = await fetch('/api/pauta', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo })
    })
    
    if (res.ok) {
      searchPauta(pautaSearch)
      toast.success('Código excluído com sucesso!')
    }
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const updates = { id: user.id }
      if (userForm.email) updates.email = userForm.email
      if (userForm.nome) updates.nome = userForm.nome
      if (userForm.password) updates.password = userForm.password

      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      const data = await res.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setUser(data.user)
        setEditingUser(false)
        setUserForm({ email: '', nome: '', password: '' })
        toast.success('Perfil atualizado com sucesso!')
      }
    } catch (error) {
      toast.error('Erro ao atualizar perfil: ' + error.message)
    } finally {
      setLoading(false)
    }
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

  // Export Cliente to PDF with products
  const exportClienteToPDF = async (cliente) => {
    const doc = new jsPDF()
    
    // Título
    doc.setFontSize(20)
    doc.text('Relatório do Cliente', 14, 20)
    
    // Linha decorativa
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(0.5)
    doc.line(14, 25, 196, 25)
    
    // Detalhes do Cliente
    doc.setFontSize(14)
    doc.setTextColor(59, 130, 246)
    doc.text('Informações do Cliente', 14, 35)
    
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text(`Nome: ${cliente.nome || 'N/A'}`, 14, 45)
    doc.text(`NIF: ${cliente.nif || 'N/A'}`, 14, 52)
    doc.text(`Telefone: ${cliente.telefone || 'N/A'}`, 14, 59)
    doc.text(`Email: ${cliente.email || 'N/A'}`, 14, 66)
    doc.text(`Endereço: ${cliente.endereco || 'N/A'}`, 14, 73)
    
    // Buscar produtos deste cliente
    const clienteDespachos = despachos.filter(d => d.clienteId === cliente.id)
    const clienteProdutos = produtos.filter(p => 
      clienteDespachos.some(d => d.id === p.despachoId)
    )
    
    // Produtos Classificados
    if (clienteProdutos.length > 0) {
      doc.setFontSize(14)
      doc.setTextColor(59, 130, 246)
      doc.text('Produtos Classificados', 14, 88)
      
      const tableData = clienteProdutos.map(p => {
        const despacho = despachos.find(d => d.id === p.despachoId)
        return [
          p.nome,
          p.codigo || 'N/A',
          `${p.peso} kg`,
          p.quantidade,
          `$${p.valor}`,
          despacho?.numeroSeries || 'N/A'
        ]
      })
      
      doc.autoTable({
        head: [['Produto', 'Código HS', 'Peso', 'Qtd', 'Valor', 'Nº Série']],
        body: tableData,
        startY: 93,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] }
      })
      
      // Calcular totais
      const totalPeso = clienteProdutos.reduce((sum, p) => sum + (parseFloat(p.peso) || 0), 0).toFixed(2)
      const totalQtd = clienteProdutos.reduce((sum, p) => sum + (parseInt(p.quantidade) || 0), 0)
      const totalValor = clienteProdutos.reduce((sum, p) => sum + (parseFloat(p.valor) || 0), 0).toFixed(2)
      
      const finalY = doc.lastAutoTable.finalY + 10
      doc.setFontSize(11)
      doc.setFont(undefined, 'bold')
      doc.text(`Total: ${clienteProdutos.length} produtos | Peso: ${totalPeso} kg | Quantidade: ${totalQtd} | Valor: $${totalValor}`, 14, finalY)
    } else {
      doc.setFontSize(11)
      doc.setTextColor(128, 128, 128)
      doc.text('Nenhum produto classificado para este cliente.', 14, 93)
    }
    
    // Footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, pageHeight - 10)
    
    doc.save(`cliente_${cliente.nome.replace(/\s+/g, '_')}.pdf`)
    toast.success('PDF exportado com sucesso!')
  }

  // Export Despacho to PDF with complete client data and all client products
  const exportDespachoToPDF = async (despacho) => {
    const doc = new jsPDF()
    
    // Cliente do despacho
    const cliente = despacho.clientes
    
    // Título principal
    doc.setFontSize(22)
    doc.setTextColor(59, 130, 246)
    doc.text('Relatório de Despacho', 14, 20)
    
    // Linha decorativa
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(0.5)
    doc.line(14, 25, 196, 25)
    
    // === SEÇÃO 1: INFORMAÇÕES DO CLIENTE ===
    doc.setFontSize(14)
    doc.setTextColor(59, 130, 246)
    doc.text('Dados do Cliente', 14, 35)
    
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(`Nome: ${cliente?.nome || 'N/A'}`, 14, 43)
    doc.text(`NIF: ${cliente?.nif || 'N/A'}`, 14, 49)
    doc.text(`Telefone: ${cliente?.telefone || 'N/A'}`, 14, 55)
    doc.text(`Email: ${cliente?.email || 'N/A'}`, 14, 61)
    doc.text(`Endereço: ${cliente?.endereco || 'N/A'}`, 14, 67)
    
    // === SEÇÃO 2: INFORMAÇÕES DO DESPACHO ===
    doc.setFontSize(14)
    doc.setTextColor(59, 130, 246)
    doc.text('Informações do Despacho', 14, 80)
    
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(`Número de Série: ${despacho.numeroSeries || 'N/A'}`, 14, 88)
    doc.text(`Estado: ${despacho.estado}`, 14, 94)
    doc.text(`Data de Criação: ${new Date(despacho.createdAt).toLocaleDateString('pt-BR')}`, 14, 100)
    
    // === SEÇÃO 3: TODOS OS PRODUTOS DO CLIENTE ===
    doc.setFontSize(14)
    doc.setTextColor(59, 130, 246)
    doc.text('Todos os Produtos Classificados do Cliente', 14, 113)
    
    // Buscar TODOS os despachos do cliente
    const clienteDespachos = despachos.filter(d => d.clienteId === cliente?.id)
    
    // Buscar TODOS os produtos de todos os despachos do cliente
    const todosProdutosCliente = produtos.filter(p => 
      clienteDespachos.some(d => d.id === p.despachoId)
    )
    
    if (todosProdutosCliente.length > 0) {
      const tableData = todosProdutosCliente.map(p => {
        const desp = despachos.find(d => d.id === p.despachoId)
        return [
          p.nome,
          p.codigo || 'N/A',
          `${p.peso} kg`,
          p.quantidade.toString(),
          `$${p.valor}`,
          desp?.numeroSeries || 'N/A'
        ]
      })
      
      // Calcular totais
      const totalPeso = todosProdutosCliente.reduce((sum, p) => sum + (parseFloat(p.peso) || 0), 0).toFixed(2)
      const totalQtd = todosProdutosCliente.reduce((sum, p) => sum + (parseInt(p.quantidade) || 0), 0)
      const totalValor = todosProdutosCliente.reduce((sum, p) => sum + (parseFloat(p.valor) || 0), 0).toFixed(2)
      
      doc.autoTable({
        head: [['Produto', 'Código HS', 'Peso', 'Qtd', 'Valor', 'Nº Série']],
        body: tableData,
        startY: 118,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 14, right: 14 }
      })
      
      // Linha de totais abaixo da tabela
      const finalY = doc.lastAutoTable.finalY + 8
      doc.setFontSize(11)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(`TOTAIS: ${todosProdutosCliente.length} produtos | Peso: ${totalPeso} kg | Quantidade: ${totalQtd} | Valor Total: $${totalValor}`, 14, finalY)
    } else {
      doc.setFontSize(10)
      doc.setTextColor(128, 128, 128)
      doc.text('Nenhum produto classificado para este cliente.', 14, 123)
    }
    
    // === FOOTER ===
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(`Documento gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, pageHeight - 10)
    doc.text(`Sistema: Despacho Online | Cliente: ${cliente?.nome}`, 14, pageHeight - 6)
    
    // Salvar PDF
    const fileName = `despacho_${despacho.numeroSeries?.replace(/\//g, '_') || despacho.id}_${cliente?.nome.replace(/\s+/g, '_')}.pdf`
    doc.save(fileName)
    toast.success('PDF exportado com sucesso!')
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
      <>
        <Toaster position="top-right" />
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
      </>
    )
  }

  // Main Dashboard Layout
  return (
    <>
      <Toaster position="top-right" />
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
                        editingCliente?.id === cliente.id ? (
                          <TableRow key={cliente.id} className="bg-blue-50">
                            <TableCell>
                              <Input
                                value={editingCliente.nome}
                                onChange={(e) => setEditingCliente({ ...editingCliente, nome: e.target.value })}
                                placeholder="Nome"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editingCliente.nif}
                                onChange={(e) => setEditingCliente({ ...editingCliente, nif: e.target.value })}
                                placeholder="NIF"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editingCliente.telefone}
                                onChange={(e) => setEditingCliente({ ...editingCliente, telefone: e.target.value })}
                                placeholder="Telefone"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editingCliente.email}
                                onChange={(e) => setEditingCliente({ ...editingCliente, email: e.target.value })}
                                placeholder="Email"
                              />
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="sm" onClick={() => handleUpdateCliente(cliente.id)} disabled={loading}>
                                Salvar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingCliente(null)}>
                                Cancelar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ) : (
                          <TableRow key={cliente.id}>
                            <TableCell className="font-medium">{cliente.nome}</TableCell>
                            <TableCell>{cliente.nif}</TableCell>
                            <TableCell>{cliente.telefone}</TableCell>
                            <TableCell>{cliente.email}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="sm" variant="outline" onClick={() => setEditingCliente({
                                id: cliente.id,
                                nome: cliente.nome,
                                nif: cliente.nif,
                                telefone: cliente.telefone,
                                email: cliente.email,
                                endereco: cliente.endereco
                              })}>
                                <Edit size={14} />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => viewClienteDetails(cliente.id)}>
                                <Eye size={14} />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteCliente(cliente.id)}>
                                <Trash2 size={14} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      ))}
                    </TableBody>                  </Table>
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
                    <div>
                      <input
                        id={`upload-cliente-${selectedCliente.id}`}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'cliente', selectedCliente.id)}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={() => document.getElementById(`upload-cliente-${selectedCliente.id}`).click()}
                      >
                        <Upload className="mr-2" size={14} />
                        Enviar Documento
                      </Button>
                    </div>
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
                            <SelectItem value="Faltando Documento">Faltando Documento</SelectItem>
                            <SelectItem value="Em Andamento">Em Andamento</SelectItem>
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
                        editingDespacho?.id === despacho.id ? (
                          <TableRow key={despacho.id} className="bg-blue-50">
                            <TableCell>
                              <Select 
                                value={editingDespacho.clienteId} 
                                onValueChange={(value) => setEditingDespacho({ ...editingDespacho, clienteId: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                  {clientes.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editingDespacho.numeroSeries}
                                onChange={(e) => setEditingDespacho({ ...editingDespacho, numeroSeries: e.target.value })}
                                placeholder="Número de Série"
                                className="font-mono"
                              />
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={editingDespacho.estado} 
                                onValueChange={(value) => setEditingDespacho({ ...editingDespacho, estado: value })}
                              >
                                <SelectTrigger className="w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Faltando Documento">Faltando Documento</SelectItem>
                                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                                  <SelectItem value="Pronto">Pronto</SelectItem>
                                  <SelectItem value="Concluído">Concluído</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="sm" onClick={() => handleUpdateDespacho(despacho.id)} disabled={loading}>
                                Salvar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingDespacho(null)}>
                                Cancelar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ) : (
                          <TableRow key={despacho.id}>
                            <TableCell className="font-medium">{despacho.clientes?.nome}</TableCell>
                            <TableCell className="font-mono">{despacho.numeroSeries || 'N/A'}</TableCell>
                            <TableCell>
                              <Select value={despacho.estado} onValueChange={(value) => handleUpdateDespachoEstado(despacho.id, value)}>
                                <SelectTrigger className="w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Faltando Documento">Faltando Documento</SelectItem>
                                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                                  <SelectItem value="Pronto">Pronto</SelectItem>
                                  <SelectItem value="Concluído">Concluído</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="sm" variant="outline" onClick={() => { 
                                setEditingDespacho({
                                  id: despacho.id,
                                  clienteId: despacho.clienteId,
                                  numeroSeries: despacho.numeroSeries,
                                  estado: despacho.estado
                                }); 
                                fetchClientes(); 
                              }}>
                                <Edit size={14} />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => viewDespachoDetails(despacho.id)}>
                                <Eye size={14} />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteDespacho(despacho.id)}>
                                <Trash2 size={14} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
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
              <div className="flex justify-between items-center mb-4">
                <Button variant="outline" onClick={() => setCurrentView('despachos')}>
                  ← Voltar
                </Button>
                <Button onClick={() => exportDespachoToPDF(selectedDespacho)}>
                  <Download className="mr-2" size={16} />
                  Exportar PDF
                </Button>
              </div>
              
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
                  <CardTitle>Produtos Classificados</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDespacho.produtos && selectedDespacho.produtos.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>Código</TableHead>
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
                        <TableRow className="bg-gray-100 font-bold">
                          <TableCell>TOTAL</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>
                            {selectedDespacho.produtos.reduce((sum, p) => sum + (parseFloat(p.peso) || 0), 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {selectedDespacho.produtos.reduce((sum, p) => sum + (parseInt(p.quantidade) || 0), 0)}
                          </TableCell>
                          <TableCell>
                            ${selectedDespacho.produtos.reduce((sum, p) => sum + (parseFloat(p.valor) || 0), 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nenhum produto classificado</p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Documentos</CardTitle>
                    <div>
                      <input
                        id={`upload-despacho-${selectedDespacho.id}`}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'despacho', selectedDespacho.id)}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={() => document.getElementById(`upload-despacho-${selectedDespacho.id}`).click()}
                      >
                        <Upload className="mr-2" size={14} />
                        Enviar Documento
                      </Button>
                    </div>
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
            </div>
          )}

          {/* Classificação View */}
          {currentView === 'classificacao' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Classificação de Produtos</h2>
                <div className="flex gap-2">
                  <Dialog open={showPautaDialog} onOpenChange={setShowPautaDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="mr-2" size={16} />
                        Adicionar Código à Pauta
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Novo Código à Pauta</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreatePauta} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="pauta-codigo">Código *</Label>
                          <Input
                            id="pauta-codigo"
                            value={pautaForm.codigo}
                            onChange={(e) => setPautaForm({ ...pautaForm, codigo: e.target.value })}
                            required
                            placeholder="Ex: 0901111000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pauta-descricao">Descrição *</Label>
                          <Textarea
                            id="pauta-descricao"
                            value={pautaForm.descricao}
                            onChange={(e) => setPautaForm({ ...pautaForm, descricao: e.target.value })}
                            required
                            placeholder="Ex: Café não torrado, não descafeinado"
                            rows={3}
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? 'Adicionando...' : 'Adicionar à Pauta'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
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
                          <Label htmlFor="produto-valor">Valor</Label>
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
                        <Label htmlFor="pauta-search">Buscar Código (Pauta)</Label>
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
                              editingPauta?.codigo === p.codigo ? (
                                <div key={p.id} className="p-3 bg-green-50 rounded border-2 border-green-300">
                                  <Input
                                    value={editingPauta.codigo}
                                    onChange={(e) => setEditingPauta({ ...editingPauta, codigo: e.target.value })}
                                    placeholder="Código"
                                    className="font-mono font-bold mb-2"
                                  />
                                  <Textarea
                                    value={editingPauta.descricao}
                                    onChange={(e) => setEditingPauta({ ...editingPauta, descricao: e.target.value })}
                                    placeholder="Descrição"
                                    rows={2}
                                    className="text-sm mb-2"
                                  />
                                  <div className="flex space-x-2">
                                    <Button size="sm" onClick={() => handleUpdatePauta(p.codigo)} disabled={loading}>
                                      Salvar
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditingPauta(null)}>
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  key={p.id}
                                  className="p-3 bg-blue-50 hover:bg-blue-100 rounded transition group relative"
                                >
                                  <div onClick={() => selectHSCode(p.codigo, p.descricao)} className="cursor-pointer">
                                    <p className="font-mono font-bold text-blue-600">{p.codigo}</p>
                                    <p className="text-sm text-gray-700">{p.descricao}</p>
                                  </div>
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setEditingPauta(p)
                                      }}
                                      className="h-7 w-7 p-0"
                                    >
                                      <Edit size={12} />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive" 
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeletePauta(p.codigo)
                                      }}
                                      className="h-7 w-7 p-0"
                                    >
                                      <Trash2 size={12} />
                                    </Button>
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="produto-hs">Código Selecionado</Label>
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
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Lista de Produtos Classificados</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Search size={20} className="text-gray-400" />
                      <Input
                        placeholder="Buscar por nº série ou cliente..."
                        value={filtroClassificacao}
                        onChange={(e) => setFiltroClassificacao(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Peso (kg)</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Despacho</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produtos.filter(produto => {
                        if (!filtroClassificacao) return true
                        const termo = filtroClassificacao.toLowerCase()
                        return (
                          produto.despachos?.numeroSeries?.toLowerCase().includes(termo) ||
                          produto.despachos?.clientes?.nome?.toLowerCase().includes(termo)
                        )
                      }).map(produto => (
                        editingProduto?.id === produto.id ? (
                          <TableRow key={produto.id} className="bg-blue-50">
                            <TableCell>
                              <Input
                                value={editingProduto.nome}
                                onChange={(e) => setEditingProduto({ ...editingProduto, nome: e.target.value })}
                                placeholder="Nome"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editingProduto.codigo}
                                onChange={(e) => setEditingProduto({ ...editingProduto, codigo: e.target.value })}
                                placeholder="Código"
                                className="font-mono text-blue-600"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={editingProduto.peso}
                                onChange={(e) => setEditingProduto({ ...editingProduto, peso: e.target.value })}
                                placeholder="Peso"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={editingProduto.quantidade}
                                onChange={(e) => setEditingProduto({ ...editingProduto, quantidade: e.target.value })}
                                placeholder="Qtd"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={editingProduto.valor}
                                onChange={(e) => setEditingProduto({ ...editingProduto, valor: e.target.value })}
                                placeholder="Valor"
                              />
                            </TableCell>
                            <TableCell>{produto.despachos?.clientes?.nome || 'N/A'}</TableCell>
                            <TableCell className="font-mono">{produto.despachos?.numeroSeries || 'N/A'}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="sm" onClick={() => handleUpdateProduto(produto.id)} disabled={loading}>
                                Salvar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingProduto(null)}>
                                Cancelar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ) : (
                          <TableRow key={produto.id}>
                            <TableCell className="font-medium">{produto.nome}</TableCell>
                            <TableCell className="font-mono text-blue-600">{produto.codigo || 'N/A'}</TableCell>
                            <TableCell>{produto.peso}</TableCell>
                            <TableCell>{produto.quantidade}</TableCell>
                            <TableCell>${produto.valor}</TableCell>
                            <TableCell>{produto.despachos?.clientes?.nome || 'N/A'}</TableCell>
                            <TableCell className="font-mono">{produto.despachos?.numeroSeries || 'N/A'}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="sm" variant="outline" onClick={() => setEditingProduto({
                                id: produto.id,
                                nome: produto.nome,
                                codigo: produto.codigo,
                                peso: produto.peso,
                                quantidade: produto.quantidade,
                                valor: produto.valor
                              })}>
                                <Edit size={14} />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteProduto(produto.id)}>
                                <Trash2 size={14} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
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
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Search size={20} className="text-gray-400" />
                    <Input
                      placeholder="Buscar por nome do cliente ou nº de série..."
                      value={filtroDocumentos}
                      onChange={(e) => setFiltroDocumentos(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {documentos.filter(doc => {
                      if (!filtroDocumentos) return true
                      const termo = filtroDocumentos.toLowerCase()
                      
                      // Filtrar por nome do cliente
                      if (doc.tipo === 'Cliente' && doc.clientes?.nome?.toLowerCase().includes(termo)) {
                        return true
                      }
                      
                      // Filtrar por nome do cliente ou número de série do despacho
                      if (doc.tipo === 'Despacho') {
                        if (doc.despachos?.clientes?.nome?.toLowerCase().includes(termo)) {
                          return true
                        }
                        if (doc.despachos?.numeroSeries?.toLowerCase().includes(termo)) {
                          return true
                        }
                      }
                      
                      // Filtrar por nome do arquivo
                      if (doc.fileName?.toLowerCase().includes(termo)) {
                        return true
                      }
                      
                      return false
                    }).map(doc => (
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
                                <span>{doc.despachos.clientes?.nome} - {doc.despachos.numeroSeries}</span>
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
                    {documentos.filter(doc => {
                      if (!filtroDocumentos) return true
                      const termo = filtroDocumentos.toLowerCase()
                      
                      if (doc.tipo === 'Cliente' && doc.clientes?.nome?.toLowerCase().includes(termo)) {
                        return true
                      }
                      
                      if (doc.tipo === 'Despacho') {
                        if (doc.despachos?.clientes?.nome?.toLowerCase().includes(termo)) {
                          return true
                        }
                        if (doc.despachos?.numeroSeries?.toLowerCase().includes(termo)) {
                          return true
                        }
                      }
                      
                      if (doc.fileName?.toLowerCase().includes(termo)) {
                        return true
                      }
                      
                      return false
                    }).length === 0 && filtroDocumentos && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Nenhum documento encontrado para "{filtroDocumentos}"</p>
                      </div>
                    )}
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
                  <div className="flex justify-between items-center">
                    <CardTitle>Informações da Conta</CardTitle>
                    {!editingUser && (
                      <Button variant="outline" onClick={() => {
                        setEditingUser(true)
                        setUserForm({
                          email: user?.email || '',
                          nome: user?.nome || '',
                          password: ''
                        })
                      }}>
                        <Edit className="mr-2" size={16} />
                        Editar Perfil
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingUser ? (
                    <form onSubmit={handleUpdateUser} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-email">Email</Label>
                        <Input
                          id="user-email"
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                          placeholder="Novo email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-nome">Nome</Label>
                        <Input
                          id="user-nome"
                          value={userForm.nome}
                          onChange={(e) => setUserForm({ ...userForm, nome: e.target.value })}
                          placeholder="Novo nome"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-password">Nova Senha (opcional)</Label>
                        <Input
                          id="user-password"
                          type="password"
                          value={userForm.password}
                          onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                          placeholder="Deixe em branco para manter a senha atual"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => {
                          setEditingUser(false)
                          setUserForm({ email: '', nome: '', password: '' })
                        }}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div>
                        <Label className="text-gray-500">Email</Label>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Nome</Label>
                        <p className="font-medium">{user?.nome || 'Não informado'}</p>
                      </div>
                    </>
                  )}
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
    </>
  )
}
