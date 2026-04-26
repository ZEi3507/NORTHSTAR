import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { EchoButton } from '../../components/ui/EchoButton';
import Nav from '../../components/Nav';
import Loading from '../../components/Loading';

const InsightDetail: React.FC = () => {
  const { insightId } = useParams<{ insightId: string }>();
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      if (!insightId) return;
      try {
        const docSnap = await getDoc(doc(db, 'sacred-insights', insightId));
        if (docSnap.exists()) {
          setInsight({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [insightId]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-void text-slate-200">
      <Nav />
      <main className="pt-32 max-w-4xl mx-auto px-6">
        <Link to="/sacred-insights" className="text-accent-light hover:text-white mb-8 block">← Back to Insights</Link>
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-heading font-bold text-white">{insight?.fileName || 'Insight'}</h1>
            <EchoButton text={insight?.fileName || 'Insight'} />
        </div>
        <div className="liquid-glass p-8 rounded-3xl">
           <p>Content: {insight?.fileName}</p>
        </div>
      </main>
    </div>
  );
};

export default InsightDetail;
