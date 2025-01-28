import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../api.service';

interface DashboardData {
  common_questions: {
    top_questions: Array<{
      question: string;
      count: number;
      last_asked: string;
      latest_answer: string;
    }>;
    total_questions: number;
    timeframe_days: number;
  };
  topic_clusters: {
    clusters: Array<{
      cluster_id: number;
      topic_terms: string[];
      questions: Array<{
        question: string;
        answer: string;
        asked_at: string;
      }>;
      question_count: number;
    }>;
    total_questions: number;
  };
  usage_patterns: {
    daily_trends: Array<{
      date: string;
      count: number;
    }>;
    hourly_distribution: Array<{
      hour: number;
      count: number;
    }>;
  };
  sentiment_analytics: {
    total_ratings: number;
    positive_ratings: number;
    negative_ratings: number;
    satisfaction_rate: number;
    detail_records: Array<{
      sentiment: string;
      timestamp: string;
      conversation_id: string | null;
    }>;
  };
  last_updated: string;
  timeframe_days: number;
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.css'
})
export class AnalyticsDashboardComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  chatbotId: string = '';
  
  constructor(
    private http: HttpClient, 
    private ApiService: ApiService, 
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.chatbotId = this.route.snapshot.paramMap.get('id') || '';
    this.getdashboard();
  }

  getdashboard(){
    this.ApiService.getAnalyticsDashboard(this.chatbotId).subscribe(
      (data) => {
        this.dashboardData = data;
        this.initializeCharts();
      },
      (error) => console.error('Error fetching dashboard data:', error)
    );
  }

  initializeCharts() {
    if (!this.dashboardData) return;

    new Chart('dailyTrendsChart', {
      type: 'line',
      data: {
        labels: this.dashboardData.usage_patterns.daily_trends.map(d => this.formatDate(d.date)),
        datasets: [{
          label: 'Questions per Day',
          data: this.dashboardData.usage_patterns.daily_trends.map(d => d.count),
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    new Chart('hourlyDistributionChart', {
      type: 'bar',
      data: {
        labels: this.dashboardData.usage_patterns.hourly_distribution.map(h => `${h.hour}:00`),
        datasets: [{
          label: 'Questions per Hour',
          data: this.dashboardData.usage_patterns.hourly_distribution.map(h => h.count),
          backgroundColor: 'rgb(147, 51, 234)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    // Add Sentiment Chart
    new Chart('sentimentChart', {
      type: 'doughnut',
      data: {
        labels: ['Positive', 'Negative'],
        datasets: [{
          data: [
            this.dashboardData.sentiment_analytics.positive_ratings,
            this.dashboardData.sentiment_analytics.negative_ratings
          ],
          backgroundColor: ['#10B981', '#EF4444']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  getPeakHour(): number {
    if (!this.dashboardData?.usage_patterns?.hourly_distribution?.length) return 0;
    
    const peakHourData = this.dashboardData.usage_patterns.hourly_distribution.reduce(
      (max, current) => current.count > max.count ? current : max,
      this.dashboardData.usage_patterns.hourly_distribution[0]
    );
    
    return peakHourData.hour;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
