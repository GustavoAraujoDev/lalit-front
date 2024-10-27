import React, { useState, useEffect } from 'react';
import { Grid, Typography, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { BarChart, People, ShoppingCart, Money } from '@mui/icons-material';

function Home() {
    const [loading, setLoading] = useState(true);
    const [vendasCount, setVendasCount] = useState(0);
    const [produtosCount, setProdutosCount] = useState(0);
    const [vendasTotal, setVendasTotal] = useState(0);
    const [produtosTotal, setProdutosTotal] = useState(0);
    const [clientesTotal, setClientesTotal] = useState(0);
    const [LucroTotal, setLucroTotal] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [clientesResponse, vendasResponse, produtosResponse] = await Promise.all([
                fetch("https://lalitaapi.onrender.com/Clientes"),
                fetch("https://lalitaapi.onrender.com/Vendas"),
                fetch("https://lalitaapi.onrender.com/Produtos")
            ]);
            
            if (!clientesResponse.ok || !vendasResponse.ok || !produtosResponse.ok) {
                throw new Error("Erro ao buscar dados.");
            }
            
            const [clientesData, vendasData, produtosData] = await Promise.all([
                clientesResponse.json(),
                vendasResponse.json(),
                produtosResponse.json()
            ]);
            const [clienteslength, vendaslength, produtoslength] = await Promise.all([
                Object.keys(clientesData).length,
                Object.keys(vendasData).length,
                Object.keys(produtosData).length
            ]);
            setClientesTotal(clienteslength);
            setVendasCount(vendaslength);
            setProdutosCount(produtoslength);

            const vendasTotal = Object.values(vendasData).reduce((acc, vendas) => acc + vendas.totalprice, 0);
            setVendasTotal(vendasTotal);
            const produtosTotal = Object.values(produtosData).reduce((total, produto) => {
                // Convertendo os valores de preco e quantidade para números
                const preco = parseFloat(produto.precovenda) || 0; // Usando parseFloat para converter string para número
                const quantidade = parseInt(produto.quantidade) || 0; // Se não houver quantidade, usar 1 como padrão
                return total + (preco * quantidade);
              }, 0);
              
            setProdutosTotal(produtosTotal);
            
            const idsvendas = Object.values(vendasData).map(venda => venda.Vendaid);
            // Realiza as requisições para cada item da venda usando o ID da venda
            const promessasItensVendas = idsvendas.map(Vendaid => fetch(`https://lalitaapi.onrender.com/Vendas/itens/${Vendaid}`));
            
            // Aguarda todas as requisições serem concluídas
            const respostasItensVendas = await Promise.all(promessasItensVendas);
            
            // Extrai o JSON de cada resposta
            const itensVendas = await Promise.all(respostasItensVendas.map(resposta => resposta.json()));
            
            // Converte `itensVendas` em um array plano, assumindo que cada resposta pode ser um array de produtos
            const itensVendasArrays = itensVendas.flatMap(itensVenda => 
                Array.isArray(itensVenda) ? itensVenda : Object.values(itensVenda) // Altera aqui para usar Object.values
            );
            
            // Calcula o lucro total
            const LucroTotal = itensVendasArrays.reduce((total, produto) => {
                // Log do produto para diagnóstico
            
                // Acessa os campos corretamente
                const quantidade = produto.quantidade !== undefined ? produto.quantidade : 0; // Verifica se quantidade existe
                const precovenda = produto.precovenda !== undefined ? produto.precovenda : 0; // Verifica se precovenda existe
                const preco = produto.preco !== undefined ? produto.preco : 0; // Verifica se preco existe
            
                // Verifica se quantidade é um número, se não, converte para número
                const quantidadeNumerica = typeof quantidade === 'number' ? quantidade : Number(quantidade);
            
                // Verifica se as variáveis são números
                if (typeof quantidadeNumerica === 'number' && typeof precovenda === 'number' && typeof preco === 'number') {
                    // Calcula o lucro apenas se a quantidade for maior que 0
                    if (quantidadeNumerica > 0) {
                        return total + (quantidadeNumerica * (precovenda - preco));
                    } else {
                        console.warn("Quantidade inválida para produto:", produto);
                        return total; // Ignora este produto se a quantidade for inválida
                    }
                } else {
                    console.warn("Dados inválidos para produto:", produto);
                    return total; // Ignora este produto se os dados forem inválidos
                }
            }, 0);

            // Atualiza o estado com o lucro total
            setLucroTotal(LucroTotal);
            setLoading(false);
            
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <Grid container justifyContent={'center'} style={{ minHeight: '100vh', position: 'relative', backgroundColor: '#fff'}}>
            <Grid item xs={12} md={8}>
                <Typography variant="h4" color="#f5d6a8" gutterBottom style={{ textAlign: 'center', marginTop: '40px' }}>Gerencie seus Produtos com Maestria</Typography>
                <Typography variant="body1" style={{ color: 'black', marginBottom: '30px', textAlign: 'center', maxWidth: '80%', margin: '0 auto' }}>Explore todas as possibilidades do nosso aplicativo de gestão de produtos. Aqui, você tem tudo o que precisa para manter seu negócio organizado e próspero.</Typography>
                {loading ? (
                    <Grid container justifyContent="center">
                        <CircularProgress color="primary" />
                    </Grid>
                ) : (
                    <Grid container spacing={3} alignItems="center" justifyContent="center" style={{ padding: '20px' }}>
                        {[{ icon: Money, label1: `R$ ${LucroTotal.toFixed(2)}`, label2: 'Lucro' }, { icon: People, label1: clientesTotal, label2: 'Clientes' }, { icon: ShoppingCart, label1: produtosCount, label2: 'Produtos' }, { icon: BarChart, label1: vendasCount, label2: 'Vendas' }, { icon: ShoppingCart, label1: `R$ ${produtosTotal.toFixed(2)}`, label2: 'Valor dos Produtos'}, { icon: BarChart, label1: `R$ ${vendasTotal.toFixed(2)}`, label2: 'Total de Vendas' }].map((item, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Tooltip title={item.label2} placement="top">
                                        <IconButton style={{boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', backgroundColor: '#fff', width: '100%', height: '100%', padding: '20px', borderRadius: '8px', border: '2px solid #f5d6a8' }}>
                                            <Grid container direction="column" alignItems="center">
                                                <Grid item style={{ marginTop: '10px' }}>
                                                    <item.icon style={{ color: '#f5d6a8', fontSize: '2.5rem' }} />
                                                </Grid>
                                                <Grid item>
                                                    <Typography variant="h6" color="#f5d6a8">{item.label1}</Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Typography variant="body2" color="textPrimary">{item.label2}</Typography>
                                                </Grid>
                                            </Grid>
                                        </IconButton>
                                    </Tooltip>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Grid>
        </Grid>    
    );
}

export default Home;
