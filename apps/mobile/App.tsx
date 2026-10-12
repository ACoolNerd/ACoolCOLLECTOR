import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Types matching our Database Schema
interface Item {
    id: string;
    name: string;
    marketData: { price: number; grade: string; source: string }[];
    attributes: any;
}

export default function App() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In production, this points to your Next.js API or AI Engine Gateway
        // For manifestation, we simulate the fetch of our prime targets
        setTimeout(() => {
            setItems([
                {
                    id: '1',
                    name: 'Portgas.D.Ace (OP07-119) Serial',
                    attributes: { set: 'OP07', rarity: 'Secret Rare', score: 9.2 },
                    marketData: [{ price: 8900, grade: 'PSA 10', source: 'TCGplayer' }]
                },
                {
                    id: '2',
                    name: 'Monkey.D.Luffy (OP07-109) Serial',
                    attributes: { set: 'OP07', rarity: 'Secret Rare', score: 9.0 },
                    marketData: [{ price: 18000, grade: 'PSA 10', source: 'eBay' }]
                }
            ]);
            setLoading(false);
        }, 1500);
    }, []);

    const renderItem = ({ item }: { item: Item }) => {
        const latestPrice = item.marketData[0]?.price || 0;
        const grade = item.marketData[0]?.grade || 'Raw';

        return (
            <TouchableOpacity style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={styles.scoreBadge}>
                        <Text style={styles.scoreText}>{item.attributes.score}</Text>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.gradeText}>{grade}</Text>
                    <Text style={styles.priceText}>${latestPrice.toLocaleString()}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ACoolCOLLECTOR</Text>
                <Text style={styles.headerSubtitle}>Portfolio manifest • 9.8/10</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#d4a84b" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080810' },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#d4a84b', letterSpacing: 1.5 },
    headerSubtitle: { fontSize: 14, color: '#888', marginTop: 4 },
    list: { padding: 16 },
    card: {
        backgroundColor: '#15151e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#fff', flex: 1 },
    scoreBadge: {
        backgroundColor: 'rgba(212, 168, 75, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d4a84b'
    },
    scoreText: { color: '#d4a84b', fontWeight: 'bold', fontSize: 12 },
    cardBody: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, alignItems: 'baseline' },
    gradeText: { color: '#aaa', fontSize: 14 },
    priceText: { fontSize: 20, fontWeight: 'bold', color: '#00ff88' },
});