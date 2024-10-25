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
            console.log(clienteslength);
            console.log(vendaslength);
            console.log(produtosData);
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
            const promessasItensVendas = idsvendas.map(id => fetch(`https://lalitaapi.onrender.com/Vendas/itens/${id}`));
            console.log(promessasItensVendas);
            const respostasItensVendas = await Promise.all(promessasItensVendas);
            console.log(respostasItensVendas);
            const itensVendas = await Promise.all(respostasItensVendas.map(resposta => resposta.json()));
            const LucroTotal = itensVendas.reduce((total, itensVenda) => {
                const lucroItensVenda = itensVenda.reduce((totalItem, produto) => {
                    return totalItem + (produto.quantidade * (produto.precovenda - produto.preco));
                }, 0);
                return total + lucroItensVenda;
            }, 0);
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
