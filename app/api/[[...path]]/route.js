import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase.js'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

// Auth endpoints - usando tabela users customizada
const handleAuth = async (request, method) => {
  if (method === 'POST') {
    const body = await request.json()
    const { action, email, password, nome } = body

    if (action === 'register') {
      // Verificar se usuário já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single()
      
      if (existingUser) {
        return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10)

      // Criar usuário
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email,
          password: hashedPassword,
          createdAt: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      
      // Não retornar senha
      const { password: _, ...user } = data
      return NextResponse.json({ user, session: { email: user.email } })
    }

    if (action === 'login') {
      // Buscar usuário
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !user) {
        return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 400 })
      }

      // Verificar senha
      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 400 })
      }

      // Não retornar senha
      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({ user: userWithoutPassword, session: { email: user.email } })
    }

    if (action === 'logout') {
      return NextResponse.json({ success: true })
    }

    if (action === 'getUser') {
      // Para simplificar, vamos apenas retornar sucesso
      // Em produção, você usaria JWT ou cookies para gerenciar sessões
      return NextResponse.json({ user: null })
    }
  }
}

// Clientes endpoints
const handleClientes = async (request, method) => {
  if (method === 'GET') {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  }

  if (method === 'POST') {
    const body = await request.json()
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    
    const cliente = {
      id: `cliente_${uuidv4()}`,
      userId: userId,
      nome: body.nome,
      nif: body.nif,
      telefone: body.telefone || '',
      email: body.email || '',
      endereco: body.endereco || '',
      createdAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (method === 'PUT') {
    const body = await request.json()
    const { id, ...updates } = body
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { data, error } = await supabase
      .from('clientes')
      .update(updates)
      .eq('id', id)
      .eq('userId', userId)
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (method === 'DELETE') {
    const body = await request.json()
    const { id } = body
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)
      .eq('userId', userId)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }
}

// Cliente by ID
const handleClienteById = async (request, method, id) => {
  if (method === 'GET') {
    // Get cliente with documents
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (clienteError) return NextResponse.json({ error: clienteError.message }, { status: 500 })

    const { data: documentos, error: docError } = await supabase
      .from('documentos_clientes')
      .select('*')
      .eq('clienteId', id)
      .order('uploadedAt', { ascending: false })
    
    return NextResponse.json({ ...cliente, documentos: documentos || [] })
  }
}

// Documentos Clientes
const handleDocumentosClientes = async (request, method) => {
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('documentos_clientes')
      .select('*, clientes(nome)')
      .order('uploadedAt', { ascending: false })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  }

  if (method === 'POST') {
    const body = await request.json()
    const documento = {
      id: `doc_cliente_${uuidv4()}`,
      clienteId: body.clienteId,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileType: body.fileType || '',
      uploadedAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('documentos_clientes')
      .insert([documento])
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (method === 'DELETE') {
    const body = await request.json()
    const { id } = body

    const { error } = await supabase
      .from('documentos_clientes')
      .delete()
      .eq('id', id)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }
}

// Despachos endpoints
const handleDespachos = async (request, method) => {
  if (method === 'GET') {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    
    const { data, error } = await supabase
      .from('despachos')
      .select('*, clientes(nome)')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  }

  if (method === 'POST') {
    const body = await request.json()
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    
    const despacho = {
      id: `despacho_${uuidv4()}`,
      userId: userId,
      clienteId: body.clienteId,
      numeroSeries: body.numeroSeries || '',
      estado: body.estado || 'Em Aberto',
      createdAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('despachos')
      .insert([despacho])
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (method === 'PUT') {
    const body = await request.json()
    const { id, ...updates } = body

    const { data, error } = await supabase
      .from('despachos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (method === 'DELETE') {
    const body = await request.json()
    const { id } = body

    const { error } = await supabase
      .from('despachos')
      .delete()
      .eq('id', id)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }
}

// Despacho by ID
const handleDespachoById = async (request, method, id) => {
  if (method === 'GET') {
    const { data: despacho, error: despachoError } = await supabase
      .from('despachos')
      .select('*, clientes(nome)')
      .eq('id', id)
      .single()
    
    if (despachoError) return NextResponse.json({ error: despachoError.message }, { status: 500 })

    const { data: documentos } = await supabase
      .from('documentos_despachos')
      .select('*')
      .eq('despachoId', id)
      .order('uploadedAt', { ascending: false })
    
    const { data: produtos } = await supabase
      .from('produtos')
      .select('*')
      .eq('despachoId', id)
      .order('createdAt', { ascending: false })
    
    return NextResponse.json({ ...despacho, documentos: documentos || [], produtos: produtos || [] })
  }
}

// Documentos Despachos
const handleDocumentosDespachos = async (request, method) => {
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('documentos_despachos')
      .select('*, despachos(destino, clientes(nome))')
      .order('uploadedAt', { ascending: false })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  }

  if (method === 'POST') {
    const body = await request.json()
    const documento = {
      id: `doc_despacho_${uuidv4()}`,
      despachoId: body.despachoId,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileType: body.fileType || '',
      uploadedAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('documentos_despachos')
      .insert([documento])
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (method === 'DELETE') {
    const body = await request.json()
    const { id } = body

    const { error } = await supabase
      .from('documentos_despachos')
      .delete()
      .eq('id', id)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }
}

// Produtos endpoints
const handleProdutos = async (request, method) => {
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('produtos')
      .select('*, despachos(numeroSeries, clientes(nome))')
      .order('createdAt', { ascending: false })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  }

  if (method === 'POST') {
    const body = await request.json()
    const produto = {
      id: `produto_${uuidv4()}`,
      despachoId: body.despachoId,
      nome: body.nome,
      peso: body.peso || 0,
      quantidade: body.quantidade || 0,
      valor: body.valor || 0,
      codigo: body.codigo || '',
      createdAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('produtos')
      .insert([produto])
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (method === 'DELETE') {
    const body = await request.json()
    const { id } = body

    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }
}

// Pauta (HS Codes) search
const handlePauta = async (request, method) => {
  if (method === 'GET') {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')

    let query = supabase
      .from('pauta')
      .select('*')
      .order('codigo', { ascending: true })

    if (search && search.trim()) {
      // Search only in descricao (description) since codigo is numeric
      query = query.ilike('descricao', `%${search}%`)
    }

    const { data, error } = await query.limit(20)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  }

  if (method === 'POST') {
    const body = await request.json()
    const novoCodigo = {
      codigo: parseInt(body.codigo) || 0,
      descricao: body.descricao
    }

    const { data, error } = await supabase
      .from('pauta')
      .insert([novoCodigo])
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }
}

// Upload handler
const handleUpload = async (request, method) => {
  if (method === 'POST') {
    const formData = await request.formData()
    const file = formData.get('file')
    const bucket = formData.get('bucket') || 'documentos-clientes'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileName = `${Date.now()}_${file.name}`
    const fileBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(fileBuffer)

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: fileName,
      originalName: file.name
    })
  }
}

// All documents
const handleAllDocumentos = async (request, method) => {
  if (method === 'GET') {
    // Get all client documents
    const { data: clienteDocs, error: error1 } = await supabase
      .from('documentos_clientes')
      .select('*, clientes(nome)')
      .order('uploadedAt', { ascending: false })
    
    // Get all despacho documents
    const { data: despachoDocs, error: error2 } = await supabase
      .from('documentos_despachos')
      .select('*, despachos(destino, numeroContentor, clientes(nome))')
      .order('uploadedAt', { ascending: false })
    
    const allDocs = [
      ...(clienteDocs || []).map(doc => ({ ...doc, tipo: 'Cliente' })),
      ...(despachoDocs || []).map(doc => ({ ...doc, tipo: 'Despacho' }))
    ]

    allDocs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))

    return NextResponse.json(allDocs)
  }
}

// Main router
export async function GET(request) {
  const path = request.nextUrl.pathname.replace('/api/', '')
  
  if (path === 'clientes') return handleClientes(request, 'GET')
  if (path.startsWith('clientes/')) {
    const id = path.split('/')[1]
    return handleClienteById(request, 'GET', id)
  }
  if (path === 'documentos-clientes') return handleDocumentosClientes(request, 'GET')
  if (path === 'despachos') return handleDespachos(request, 'GET')
  if (path.startsWith('despachos/')) {
    const id = path.split('/')[1]
    return handleDespachoById(request, 'GET', id)
  }
  if (path === 'documentos-despachos') return handleDocumentosDespachos(request, 'GET')
  if (path === 'produtos') return handleProdutos(request, 'GET')
  if (path === 'pauta') return handlePauta(request, 'GET')
  if (path === 'documentos') return handleAllDocumentos(request, 'GET')
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(request) {
  const path = request.nextUrl.pathname.replace('/api/', '')
  
  if (path === 'auth') return handleAuth(request, 'POST')
  if (path === 'clientes') return handleClientes(request, 'POST')
  if (path === 'documentos-clientes') return handleDocumentosClientes(request, 'POST')
  if (path === 'despachos') return handleDespachos(request, 'POST')
  if (path === 'documentos-despachos') return handleDocumentosDespachos(request, 'POST')
  if (path === 'produtos') return handleProdutos(request, 'POST')
  if (path === 'pauta') return handlePauta(request, 'POST')
  if (path === 'upload') return handleUpload(request, 'POST')
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function PUT(request) {
  const path = request.nextUrl.pathname.replace('/api/', '')
  
  if (path === 'clientes') return handleClientes(request, 'PUT')
  if (path === 'despachos') return handleDespachos(request, 'PUT')
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function DELETE(request) {
  const path = request.nextUrl.pathname.replace('/api/', '')
  
  if (path === 'clientes') return handleClientes(request, 'DELETE')
  if (path === 'documentos-clientes') return handleDocumentosClientes(request, 'DELETE')
  if (path === 'despachos') return handleDespachos(request, 'DELETE')
  if (path === 'documentos-despachos') return handleDocumentosDespachos(request, 'DELETE')
  if (path === 'produtos') return handleProdutos(request, 'DELETE')
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}